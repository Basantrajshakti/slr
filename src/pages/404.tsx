import React from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import { Button } from "~/components/ui/button";

const Error = () => {
  return (
    <>
      <Head>
        <title>Not Found!</title>
        <meta name="description" content="This page doesn't exists" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="flex min-h-screen items-center bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="space-y-4 text-center">
            <div className="relative mx-auto h-[500px] w-full max-w-2xl">
              <Image
                src="/404.gif"
                alt="404 Not Found"
                fill
                className="object-contain pt-6"
                priority
                quality={85}
              />
              <h1 className=" absolute left-1/2 top-0 -translate-x-1/2 text-center text-5xl font-extrabold tracking-tight drop-shadow-lg sm:text-7xl">
                404
              </h1>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Looks like you're lost</h3>
              <p className="text-gray-600">
                The page you are looking for is not available!
              </p>
              <Button asChild className="mt-4">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Error;
