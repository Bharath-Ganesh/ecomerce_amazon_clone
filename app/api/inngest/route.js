import { serve } from "inngest/next";
/*
  The `@` symbol in imports is a path alias (set in jsconfig.json/tsconfig.json) that points to a base directory, like src/. This makes imports shorter and easier to manage.
*/
import { inngest } from "@/config/inngest";
import { syncUserCreation, syncUserDeletion, syncUserUpdation, createUserOrder } from "@/config/inngest";
// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    createUserOrder
  ],
});

