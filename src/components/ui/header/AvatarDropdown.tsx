import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  DropdownSection,
  Link,
  cn,
} from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import { signOut, useSession } from "next-auth/react";
import { isLinkActive } from "@/lib/utils";
import { usePathname } from "next/navigation";

const AvatarDropdown = ({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image: string;
}) => {
  const { data, status, update } = useSession();
  const user = data?.user;
  const userRole = user?.role;
  const isCustomer = userRole === "CUSTOMER";
  const isConsultant = userRole === "CONSULTANT";
  const isAdmin = userRole === "ADMIN";
  const isFarmer = userRole === "FARMER";
  const isSupplier = userRole === "SUPPLIER";
  const pathname = usePathname();
  const route =
    isCustomer
      ? "/customer"
      : isConsultant
      ? "/consultant"
      : isSupplier
      ? "/supplier"
      : isFarmer
      ? "/farmer"
      : "/admin";
  return (
    <Dropdown showArrow>
      <DropdownTrigger>
        <Avatar
          as="button"
          className="transition-transform"
          src={image}
          showFallback
          name={name}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Profile and Actions" variant="flat">
        <DropdownSection showDivider aria-label="profile">
          <DropdownItem
            isReadOnly
            className="hover:cursor-default"
            key="profile"
          >
            {name && <p className="font-semibold">{name}</p>}
            <p className="text-neutral-500 text-sm">{email}</p>
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider aria-label="User Dropdown Actions">
          <DropdownItem
            key="profile"
            className={cn({
              "text-emerald-500": isLinkActive({ route: "/profile", pathname }),
            })}
            href="/profile"
          >
            My Profile
          </DropdownItem>
          <DropdownItem
            key="user-panel"
            className={cn({
              "!text-emerald-500": isLinkActive({
                route,
                pathname,
              }),
            })}
            href={`
            ${
              isCustomer
                ? "/customer/scan-history"
                : isConsultant
                ? "/consultant/dashboard"
                : isAdmin
                ? "/admin/dashboard"
                : isFarmer
                ? "/farmer/dashboard"
                : "/supplier/dashboard"
            }
            `}
          >
            {isCustomer
              ? "Customer Panel"
              : isConsultant
              ? "Consultant Panel"
              : isAdmin
              ? "Admin Panel"
              : isFarmer
              ? "Farmer Dashboard"
              : "Supplier Panel"}
          </DropdownItem>
        </DropdownSection>
        <DropdownSection aria-label="logout">
          <DropdownItem
            endContent={<FontAwesomeIcon icon={faSignOut} />}
            key="logout"
            color="danger"
            onPress={() =>
              signOut({
                callbackUrl: "/",
              })
            }
            className="text-red-500"
          >
            Sign Out
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export default AvatarDropdown;
