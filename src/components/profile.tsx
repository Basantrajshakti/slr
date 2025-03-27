import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

import { inter } from "~/pages/_app";
import { Button } from "./ui/button";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Profile = () => {
  const session = useSession();
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="rounded-full px-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="scale-[1.3]"
            >
              <g fill="#F3F4F6" fillRule="evenodd" clipRule="evenodd">
                <path d="M16 9a4 4 0 1 1-8 0a4 4 0 0 1 8 0m-2 0a2 2 0 1 1-4 0a2 2 0 0 1 4 0" />
                <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11s11-4.925 11-11S18.075 1 12 1M3 12c0 2.09.713 4.014 1.908 5.542A8.99 8.99 0 0 1 12.065 14a8.98 8.98 0 0 1 7.092 3.458A9 9 0 1 0 3 12m9 9a8.96 8.96 0 0 1-5.672-2.012A6.99 6.99 0 0 1 12.065 16a6.99 6.99 0 0 1 5.689 2.92A8.96 8.96 0 0 1 12 21" />
              </g>
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent className={`font-sans ${inter.variable}`}>
          <SheetHeader>
            <SheetTitle>Profile details</SheetTitle>
            <SheetDescription>Hii, Good to see you!</SheetDescription>
          </SheetHeader>
          <div className="mb-10 mt-6 grid gap-2 py-4">
            <div>
              <b>Name:</b> {session.data?.user?.name}
            </div>
            <div>
              <b>Email:</b> {session.data?.user?.email}
            </div>
          </div>
          <SheetFooter className="absolute bottom-6 flex w-[calc(100%-48px)] !flex-row !justify-between">
            <Button asChild>
              <Link href={"/"}>Go To Home</Link>
            </Button>
            <Button onClick={() => setLogoutConfirm(true)}>Logout</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Logout Alert */}
      <AlertDialog open={logoutConfirm} onOpenChange={setLogoutConfirm}>
        <AlertDialogContent className={`font-sans ${inter.variable}`}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You really want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setLogoutConfirm(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => void signOut()}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Profile;
