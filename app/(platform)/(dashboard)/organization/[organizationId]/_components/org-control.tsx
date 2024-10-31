"use client"

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useOrganizationList } from "@clerk/nextjs";

export const OrgControl = () => {
    const params = useParams();
    const { setActive } = useOrganizationList();

    useEffect(() => {
        if (!setActive) return;

        setActive({
            organization: params?.organizationId as string,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setActive]);

    return null;
}