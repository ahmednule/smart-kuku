import React from "react";
import {
  Button,
  Spinner,
} from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import AvatarDropdown from "./AvatarDropdown";
import { signIn, useSession } from "next-auth/react";

const LoginDropdown = () => {
  const { data, status } = useSession();
  const user = data?.user;
  const isLoading = status === "loading";
  return (
    <>
      {!user && !isLoading && (
        <Button
          startContent={<FontAwesomeIcon icon={faRightToBracket} />}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
          onPress={() => signIn("google")}
        >
          Login
        </Button>
      )}
      {isLoading && <Spinner color="success" />}
      {user && !isLoading && (
        <AvatarDropdown
          email={user.email || ""}
          image={user.image || ""}
          name={user.name || ""}
        />
      )}
    </>
  );
};

export default LoginDropdown;
