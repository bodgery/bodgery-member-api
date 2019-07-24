package Util;
use strict;
use warnings;
use Cpanel::JSON::XS 'decode_json';
use DBI;
use LWP::UserAgent;
use YAML;

require Exporter;
our @ISA = qw{ Exporter };
our @EXPORT_OK = qw{
    set_pg_auth
    pg_dbd
    fetch_pg_members
    get_wa_config
    get_wa_oauth
    fetch_wa_members
};
our @EXPORT = @EXPORT_OK;

use constant WA_OAUTH_URI => 'https://oauth.wildapricot.org/auth/token';
use constant WA_BASE_CONTACT_URI => 'https://api.wildapricot.org/v2/Accounts';


{
    my $DBH;
    my ($DB_USER, $DB_PASS, $DB_NAME);

    sub set_pg_auth
    {
        my ($user, $pass, $DB_NAME) = @_;
        $DB_USER = $user;
        $DB_PASS = $pass;
        return;
    }

    sub pg_dbd
    {
        return $DBH if defined $DBH;
        $DBH = DBI->connect(
            'dbi:Pg:dbname=' . $DB_NAME,
            $DB_USER,
            $DB_PASS,
            {
                AutoCommit => 0,
            },
        ) or die "Could not connect to database: " . DBI->errstr;
        return $DBH;
    }
}

sub fetch_pg_members
{
    my $dbh = pg_dbd();
    my $sth = $dbh->prepare_cached(
        'SELECT rfid, active, first_name, last_name'
        . ' FROM members'
    ) or die "Could not prepare statement: " . $dbh->errstr;
    $sth->execute() or die "Could not execute statement: " . $sth->errstr;

    my %results;
    while( my $row = $sth->fetchrow_arrayref ) {
        my ($rfid, $active, $fname, $lname) = @$row;
        $results{$rfid} = {
            active => $active,
            first_name => $fname,
            last_name => $lname,
        };
    }
    $sth->finish;
    $dbh->disconnect;

    return \%results;
}

sub get_wa_config
{
    my ($conf_file) = @_;

    my $conf_yml = '';
    open( my $in, '<', $conf_file )
        or die "Could not open '$conf_file': $!\n";
    while(<$in>) {
        $conf_yml .= $_;
    }
    close( $in );

    my %conf = %{ +Load( $conf_yml ) };
    return @conf{qw{
        wa_api_client
        wa_api_secret
        wa_account_id
    }};
}

sub get_wa_oauth
{
    my ($user, $pass) = @_;
    my $token = undef;

    my $www = My::WWW->new;
    $www->set_cred( $user, $pass );
    my $response = $www->post( WA_OAUTH_URI, {
        grant_type => 'client_credentials',
        scope => 'contacts_view',
    });

    if( $response->is_success && $response->code == 200 ) {
        my $json = $response->content;
        my $data = decode_json( $json );
        $token = $data->{access_token};
    }
    else {
        die "Could not fetch oauth token: " . $response->status_line . "\n";
    }

    return $token;
}

sub fetch_wa_members
{
    my ($oauth_token, $account) = @_;
    my %members = ();

    my $uri = WA_BASE_CONTACT_URI . '/' . $account . '/Contacts?$async=false';
    #$uri .= '&$select=' . join( ',', map "'$_'", (
    #    'First name',
    #    'Last name',
    #    'Email',
    #    'RFID tag #',
    #    'Member',
    #));

    my $header = HTTP::Headers->new(
        Authorization => 'Bearer ' . $oauth_token
    );
    my $request = HTTP::Request->new(
        'GET',
        $uri,
        $header,
    );

    my $www = LWP::UserAgent->new;
    my $response = $www->request( $request );

    if( $response->is_success && $response->code == 200 ) {
        my $json = $response->content;
        my $data = decode_json( $json );

        %members = map {
            my %member = map {
                ($_->{FieldName} => $_->{Value})
            } @{ $_->{FieldValues} };
            
            ( $_->{Id} => {
                'fname' => $member{'First name'},
                'lname' => $member{'Last name'},
                'email' => $member{'Email'},
                'phone' => $member{'Phone'},
                'rfid' => $member{'RFID tag #'},
                'is_active' => $member{'Member'},
                'id' => $_->{Id},
                #dump => $_,
            });
        } $data->{Contacts}->@*;
    }
    else {
        die "Could not retrieve contacts from WA: "
            . $response->status_line . "\n";
    }

    return \%members;
}



package My::WWW;
use base 'LWP::UserAgent';

my ($basic_user, $basic_pass);

sub set_cred
{
    my ($self, $user, $pass) = @_;
    $basic_user = $user;
    $basic_pass = $pass;
    return;
}

sub get_basic_credentials
{
    return ($basic_user, $basic_pass);
}


1;
__END__

