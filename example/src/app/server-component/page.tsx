// import { FlagProvider, useFlag, useFlagsStatus } from "@unleash/nextjs";
// import { LoadingDots } from "@vercel/examples-ui";
import type { NextPage } from "next";

// const ExampleComponent = () => {
//   const isEnabled = useFlag("snowing");
//   const { flagsReady } = useFlagsStatus();

//   if (!flagsReady) {
//     return <LoadingDots />;
//   }

//   return <>Feature toggle is: {isEnabled ? "ENABLED" : "DISABLED"}</>;
// };

// const ClientSideRenderedPage: NextPage = () => (
//   <FlagProvider>
//     <ExampleComponent />
//   </FlagProvider>
// );


const ClientSideRenderedPage: NextPage = () => (
    <div>
        <h1 className="text-4xl font-bold">Client Side Rendered Page</h1>
        <p className="text-lg mt-4">This page is rendered on the client side.</p>
    </div>
);

export default ClientSideRenderedPage;
