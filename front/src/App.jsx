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
const ForgotPasswordPage = lazy(() =>
  import("./pages/auth/ForgotPasswordPage.jsx")
);
const ResetPasswordPage = lazy(() =>
  import("./pages/auth/ResetPasswordPage.jsx")
);
const Layout = lazy(() => import("./components/Layout.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const MeetingPage = lazy(() => import("./pages/Meeting.jsx"));
const UpcomingPage = lazy(() => import("./pages/Upcoming.jsx"));
const PreviousPage = lazy(() => import("./pages/Previous.jsx"));
const RecordingsPage = lazy(() => import("./pages/Recordings.jsx"));
const VideoPlayer = lazy(() => import("./components/VideoPlayer.jsx"));
const Verify = lazy(() => import("./pages/auth/Verify.jsx"));
const TopUp = lazy(() => import("./pages/TopUp.jsx"));
const Teachers = lazy(() => import("./pages/Teachers.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Students = lazy(() => import("./pages/Students.jsx"));
const Coordinators = lazy(() => import("./pages/Coordinators.jsx"));
const Calendar = lazy(() => import("./pages/Calendar.jsx"));
const GoingOn = lazy(() => import("./pages/GoingOn.jsx"));
const Plan = lazy(() => import("./pages/Plan.jsx"));
const Landing = lazy(() => import("./pages/landing/Landing.jsx"));
const WalletHistory = lazy(() => import("./pages/WalletHistory.jsx"));
const Parents = lazy(() => import("./pages/Parents.jsx"));
const PaymentProof = lazy(() => import("./pages/PaymentProof.jsx"));
const CommentsPage = lazy(() => import("./pages/CommentsPage.jsx"));
const LandingContentManagementPage = lazy(() =>
  import("./pages/admin/LandingContentManagementPage.jsx")
);
const DashboardMessages = lazy(() => import("./pages/admin/DashboardMessages.jsx")); // Import DashboardMessages page
const AdminRoute = lazy(() => import("./components/AdminRoute.jsx"));

// Potential Client Pages
const PotentialClientsListView = lazy(() =>
  import("./components/ListView.jsx")
);
const PotentialClientDetailView = lazy(() =>
  import("./components/DetailView.jsx")
);
const PotentialClientCreateForm = lazy(() =>
  import("./components/CreateForm.jsx")
);

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { index: true, element: <Landing /> },
      { path: "signup", element: <SignUp /> },
      { path: "signin", element: <SignIn /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password/:token", element: <ResetPasswordPage /> },
      { path: "auth/verify/:token", element: <Verify /> },
      {
        path: "dashboard",
        element: <Layout />,
        children: [
          {
            index: true,
            element: (
              <StreamClientProvider>
                <Home />
              </StreamClientProvider>
            ),
          },
          { path: "topup", element: <TopUp /> },
          {
            path: "calendar",
            element: (
              <StreamClientProvider>
                <Calendar />
              </StreamClientProvider>
            ),
          },
          { path: "teachers", element: <Teachers /> },
          { path: "coordinators", element: <Coordinators /> },
          { path: "profile/:id", element: <Profile /> },
          { path: "myteachers", element: <Teachers /> },
          { path: "mystudents", element: <Students /> },
          { path: "plan", element: <Plan /> },
          { path: "students", element: <Students /> },
          { path: "parents", element: <Parents /> },
          { path: "wallet-history", element: <WalletHistory /> },
          { path: "payment-proof", element: <PaymentProof /> },
          { path: "comments", element: <CommentsPage /> },

          { path: "potential-clients", element: <PotentialClientsListView /> },
          {
            path: "potential-clients/create",
            element: <PotentialClientCreateForm />,
          },
          {
            path: "potential-clients/:id",
            element: <PotentialClientDetailView />,
          },
          {
            // Admin Routes
            path: "landing-content",
            element: <AdminRoute><LandingContentManagementPage /></AdminRoute>,
          },
          {
            path: "messages",
            element: <AdminRoute><DashboardMessages /></AdminRoute>,
          },
          {
            path: "meeting",
            children: [
              {
                path: "upcoming",
                element: (
                  <StreamClientProvider>
                    <UpcomingPage />
                  </StreamClientProvider>
                ),
              },
              {
                path: "previous",
                element: (
                  <StreamClientProvider>
                    <PreviousPage />
                  </StreamClientProvider>
                ),
              },
              {
                path: "now",
                element: (
                  <StreamClientProvider>
                    <GoingOn />
                  </StreamClientProvider>
                ),
              },
              {
                path: "recordings",
                children: [
                  {
                    index: true,
                    element: (
                      <StreamClientProvider>
                        <RecordingsPage />
                      </StreamClientProvider>
                    ),
                  },
                  {
                    path: ":id",
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
