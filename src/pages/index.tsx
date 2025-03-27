import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <>
      <Head>
        <title>Project Management Tool</title>
        <meta name="description" content="Created by Basantraj Shakti" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=" flex min-h-screen flex-col items-center justify-center ">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-center text-5xl font-extrabold tracking-tight  sm:text-[5rem]">
            Project Management Tool
          </h1>

          <h6 className="">
            Created by <b>Basantraj Shakti</b>
          </h6>
          <div className="grid grid-cols-1 gap-4 ">
            <Link
              className="flex max-w-sm flex-col gap-4 rounded-xl border border-slate-500 bg-white/10 p-4  hover:bg-black/10"
              href="https://github.com/Basantrajshakti/slr"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Documentation →</h3>
              <div className="text-lg">
                Learn more about project, the libraries it uses, and how to
                deploy it.
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <AuthShowcase />
          </div>
        </div>
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl ">
        {sessionData && <span>Hello {sessionData.user?.name}</span>}
      </p>
      {sessionData ? (
        <div className="flex gap-5">
          <Button
            asChild
            className="font-semibold  no-underline transition focus-visible:outline-blue-600"
            // onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            <Link href={"/tasks"}>Tasks</Link>
          </Button>
        </div>
      ) : (
        <div className="flex gap-5">
          <Button
            asChild
            className="font-semibold  no-underline transition focus-visible:outline-blue-600"
            // onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            <Link href={"/signin"}>Sign in</Link>
          </Button>
          <Button
            asChild
            className="font-semibold  no-underline transition focus-visible:outline-blue-600"
            // onClick={sessionData ? () => void signOut() : () => void signIn()}
          >
            <Link href={"/signup"}>Sign up</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
