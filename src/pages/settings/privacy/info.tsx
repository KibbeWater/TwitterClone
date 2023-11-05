import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import SettingsCheckbox from "~/components/Settings/SettingsCheckbox";
import SettingsLayout from "~/components/Site/Layouts/SettingsLayout";

import { api } from "~/utils/api";
import { PERMISSIONS, hasPermission } from "~/utils/permission";
import { isPremium } from "~/utils/user";

export default function AccountInfo() {
    const [followingsHidden, setFollowingsHidden] = useState(false);
    const [postsHidden, setPostsHidden] = useState(false);
    const [verifiedBadgeHidden, setVerifiedBadgeHidden] = useState(false);

    const { data: session, update: _reloadSession, status } = useSession();

    const resetStates = useCallback<
        (user: {
            permissions: string;
            roles: { permissions: string }[];
        }) => void
    >((user: { permissions: string; roles: { permissions: string }[] }) => {
        setFollowingsHidden(hasPermission(user, PERMISSIONS.HIDE_FOLLOWINGS));
        setPostsHidden(hasPermission(user, PERMISSIONS.HIDE_POSTS));
        setVerifiedBadgeHidden(
            hasPermission(user, PERMISSIONS.HIDE_VERIFICATION),
        );
    }, []);

    const { mutate: _setFollowingsHidden } =
        api.user.setFollowingsProtected.useMutation({
            onError: () => _reloadSession(),
        });
    const { mutate: _setPostsHidden } = api.user.setPostsProtected.useMutation({
        onError: () => _reloadSession(),
    });
    const { mutate: _setVerifiedBadgeHidden } =
        api.user.setVerificationProtected.useMutation({
            onError: () => _reloadSession(),
        });

    const isUserPremium = isPremium(session?.user);

    useEffect(() => {
        if (!session?.user) return;

        resetStates(session.user);
    }, [session?.user, resetStates]);

    const handleFollowingsHiddenChange = (e: boolean) => {
        setFollowingsHidden(e);
        _setFollowingsHidden({ protected: e });
    };

    const handlePostsHiddenChange = (e: boolean) => {
        setPostsHidden(e);
        _setPostsHidden({ protected: e });
    };

    const handleVerifiedBadgeHiddenChange = (e: boolean) => {
        setVerifiedBadgeHidden(e);
        _setVerifiedBadgeHidden({ protected: e });
    };

    return (
        <SettingsLayout title="Account information">
            <SettingsCheckbox
                title="Hide your followings"
                description={`Hide the list of people you follow or follows you on your profile.${
                    !isUserPremium
                        ? " Purchase Twatter RED to access this feature."
                        : ""
                }`}
                value={followingsHidden}
                onChange={handleFollowingsHiddenChange}
                disabled={!isUserPremium || status === "loading"}
            />
            <SettingsCheckbox
                title="Hide your posts"
                description={`Hide posts that appear on your profile. Posts may still appear in the feed.${
                    !isUserPremium
                        ? " Purchase Twatter RED to access this feature."
                        : ""
                }`}
                value={postsHidden}
                onChange={handlePostsHiddenChange}
                disabled={!isUserPremium || status === "loading"}
            />
            <SettingsCheckbox
                title="Hide your verification badge"
                description={`Hide your verification badge from your profile.`}
                value={verifiedBadgeHidden}
                onChange={handleVerifiedBadgeHiddenChange}
                disabled={status === "loading"}
            />
        </SettingsLayout>
    );
}
