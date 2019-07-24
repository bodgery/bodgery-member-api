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
    'db-user=s' => \$db_user,
    'db-pass=s' => \$db_pass,
    'db=s' => \$db,
    'conf=s' => \$conf_file,
);
die "Need DB user\n" if ! $db_user;
die "Need DB pass\n" if ! $db_pass;

sub reconcile
{
    my ($pg_members, $wa_members) = @_;
    my %reconciled_members = ();
    my %missing_wa = ();
    my %missing_pg = ();
    # TODO
    return (\%reconciled_members, \%missing_wa, \%missing_pg);
}

sub warn_missing
{
    my ($name, $missing) = @_;
    # TODO;
    return;
}

sub dump_sql
{
    my ($members) = @_;
    say "-- Begin SQL dump of members";
    say "BEGIN;";

    # TODO

    say "COMMIT;";
    say "-- End SQL dump of members";
    return;
}



{
    my ($wa_api_user, $wa_api_pass, $wa_account) = get_wa_config(
        $conf_file );
warn "Fetching WA OAuth key\n";
    my $wa_oauth = get_wa_oauth( $wa_api_user, $wa_api_pass );

    #set_pg_auth( $db_user, $db_pass, 'bodgery_rfid' );
    #my $pg_members = fetch_pg_members();
warn "Fetching WA members\n";
    my $wa_members = fetch_wa_members( $wa_oauth, $wa_account );

    #my ($reconciled_members, $missing_wa, $missing_pg)
    #    = reconcile( $pg_members, $wa_members );
    #warn_missing( "WA", $missing_wa ) if %$missing_wa;
    #warn_missing( "PG", $missing_pg ) if %$missing_pg;
    #dump_sql( $reconciled_members );
}
