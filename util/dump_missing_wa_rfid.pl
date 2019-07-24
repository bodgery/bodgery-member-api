#!perl
use v5.26;
use warnings;
use Getopt::Long ();

use lib 'util/perl_lib';
use Util;


my $db_user = '';
my $db_pass = '';
my $db = 'bodgery_rfid';
my $conf_file = './config.yaml';
Getopt::Long::GetOptions(
    'conf=s' => \$conf_file,
);

use constant WA_CONTACT_BASE_LINK => 'https://thebodgery.wildapricot.org/admin/contacts/details/membership/?contactId=';


sub dump_missing_rfid
{
    my ($members) = @_;

    foreach my $wa_id (keys %$members) {
        my $member = $members->{$wa_id};
        next if defined $member->{rfid} || $member->{rfid};
        say join( ",",
            $member->{fname},
            $member->{lname},
            WA_CONTACT_BASE_LINK . $wa_id,
        );
    }
}


{
    my ($wa_api_user, $wa_api_pass, $wa_account) = get_wa_config(
        $conf_file );
    my $wa_oauth = get_wa_oauth( $wa_api_user, $wa_api_pass );
    my $wa_members = fetch_wa_members( $wa_oauth, $wa_account );
    dump_missing_rfid( $wa_members );
}
