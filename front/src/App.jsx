import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Center,
  ChakraProvider,
  ColorModeProvider,
  extendTheme,
  Spinner,
} from "@chakra-ui/react";
import StreamClientProvider from "./providers/StreamClientProvider.jsx";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const SignUp = lazy(() => import("./pages/auth/SignUp.jsx"));
const SignIn = lazy(() => import("./pages/auth/SignIn.jsx"));
const Layout = lazy(() => import("./components/Layout.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const MeetingPage = lazy(() => import("./pages/Meeting.jsx"));
const UpcomingPage = lazy(() => import("./pages/Upcoming.jsx"));
const PreviousPage = lazy(() => import("./pages/Previous.jsx"));
const RecordingsPage = lazy(() => import("./pages/Recordings.jsx"));
const VideoPlayer = lazy(() => import("./components/VideoPlayer.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "signup", element: <SignUp /> },
      { path: "signin", element: <SignIn /> },
      {
        path: "/",
        element: (
          <StreamClientProvider>
            <Home />
          </StreamClientProvider>
        ),
        index: true,
      },
      {
        path: "/meeting",
        children: [
          {
            path: "/meeting/upcoming",
            element: (
              <StreamClientProvider>
                <UpcomingPage />
              </StreamClientProvider>
            ),
          },
          {
            path: "/meeting/previous",
            element: (
              <StreamClientProvider>
                <PreviousPage />
              </StreamClientProvider>
            ),
          },
          {
            path: "/meeting/recordings",
            children: [
              {
                path: "/meeting/recordings",
                element: (
                  <StreamClientProvider>
                    <RecordingsPage />
                  </StreamClientProvider>
                ),
              },
              {
                path: "/meeting/recordings/:id",
                element: (
                  <StreamClientProvider>
                    <VideoPlayer />
                  </StreamClientProvider>
                ),
              },
            ],
          },
          {
            path: ":id",
            element: (
              <StreamClientProvider>
                <MeetingPage />
              </StreamClientProvider>
            ),
          },
        ],
      },
    ],
  },
]);

export default function App() {
  const usedTheme = useSelector((state) => state.colorMode.theme);
  const theme = extendTheme(usedTheme);

  return (
    <ColorModeProvider>
      <ChakraProvider theme={theme}>
        <Suspense
          fallback={
            <Center h="200px">
              <Spinner size="xl" />
            </Center>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </ChakraProvider>
    </ColorModeProvider>
  );
}
