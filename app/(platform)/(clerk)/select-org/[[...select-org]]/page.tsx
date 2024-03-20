import { OrganizationList } from "@clerk/nextjs";

export default function CrateOrganizationPage() {
    return (
        <OrganizationList
            hidePersonal
            afterSelectOrganizationUrl="/organization/:id"
            afterCreateOrganizationUrl="/organization/:id"
        />
    )
}