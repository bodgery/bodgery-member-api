#!perl
use v5.26;
use warnings;
use Getopt::Long ();

use lib 'util/perl_lib';
use Util;


my $conf_file = './config.yaml';
Getopt::Long::GetOptions(
    'conf=s' => \$conf_file,
);

use constant WA_CONTACT_BASE_LINK => 'https://thebodgery.wildapricot.org/admin/contacts/details/membership/?contactId=';


sub dump_data
{
    my ($members) = @_;

    foreach my $wa_id (keys %$members) {
        my $member = $members->{$wa_id};
        say join( ',', 
            $member->{fname},
            $member->{lname},
            $member->{id},
            $member->{email},
            $member->{phone},
            $member->{rfid},
            $member->{is_active},
        );
    }

    return;
}

{
    my ($wa_api_user, $wa_api_pass, $wa_account) = get_wa_config(
        $conf_file );
    my $wa_oauth = get_wa_oauth( $wa_api_user, $wa_api_pass );
    my $wa_members = fetch_wa_members( $wa_oauth, $wa_account );
    dump_data( $wa_members );
}
