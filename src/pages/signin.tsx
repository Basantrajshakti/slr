import React from "react";
import AuthForm from "~/components/authForm";
import { type GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

const SignIn = () => {
  return <AuthForm login={true} />;
};

export default SignIn;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession({ req: context.req });

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
}
