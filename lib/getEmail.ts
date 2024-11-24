import { auth } from "@clerk/nextjs/server"
import prismadb from "./prismadb";
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export const getEmail = async () => {
    const {userId} = auth();

    if(!userId) {
        return;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: {
            userId
        }
    });

    if(userApiLimit) {
        return userApiLimit.email;
    }
    const response = await clerkClient.users.getUser(userId);

    return response.emailAddresses[0].emailAddress;

}