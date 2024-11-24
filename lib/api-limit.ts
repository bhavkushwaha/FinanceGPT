import { auth } from "@clerk/nextjs/server";

import prismadb from "@/lib/prismadb";

import { MAX_FREE_COUNTS } from "@/constants";

import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export const increaseApiLimit = async () => {
    const { userId } = auth();

    if(!userId) {
        return;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: {
            userId
        }
    });


    if(userApiLimit) {
        await prismadb.userApiLimit.update({
            where: {userId: userId},
            data: {count: userApiLimit.count + 1},
        });
    }
    else {
        const response = await clerkClient.users.getUser(userId)
        // console.log(response);
        
        
        await prismadb.userApiLimit.create({
            data: {userId: userId, count: 1, email: response.emailAddresses[0].emailAddress}
        });
    }
    };

export const checkApiLimit = async () => {
    const { userId } = auth();

    if(!userId) {
        return false;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: {
            userId: userId
        }
    });

    if(!userApiLimit || userApiLimit.count < MAX_FREE_COUNTS) {
        return true;
    }
    else {
        return false;
    }

};

export const getApiLimitCount = async () => {
    const { userId } = auth();

    if(!userId) {
        return 0;
    }

    const userApiLimit = await prismadb.userApiLimit.findUnique({
        where: {
            userId
        }
    });

    if(!userApiLimit) {
        return 0;
    }

    return userApiLimit.count;

}