import React from "react";
import { createAppContainer } from "react-navigation";
import Home from "../pages/Home";
import signupOptions from "../pages/signupOptions";
import signup from "../pages/signup";
import { createBottomTabNavigator } from "react-navigation-tabs";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import AdminUsers from "../pages/admin/Users";
import PatientProfile from "../pages/admin/PatientProfile";
import ViewMood from "../pages/ViewMood";
import PatientChat from "../pages/admin/PatientChat";
import Request1On1Session from "../pages/user/Request10n1Session";
import Settings from "../pages/sidebar/Setting";
import AssignedUsers from "../pages/therapist/Users";
import PatientNotes from "../pages/therapist/PatientNotes";
import AdminTherapists from "../pages/admin/Therapists";
import AddTherapist from "../pages/admin/AddTherapist";
import TherapistProfileAdmin from "../pages/admin/TherapistProfileAdmin";
import AdminChangeTherapistRequests from "../pages/admin/ChangeTherapistRequests";
import AdminTherapistConnectedUsers from "../pages/admin/TherapistConnectedUsers";
import AdminPaymentVerificationRequests from "../pages/admin/PaymentVerification";
import AdminDonateSessionRequests from "../pages/admin/DonateSessionRequests";
import Admin1on1SessionRequests from "../pages/admin/1on1SessionRequests";
import Subscribe from "../pages/Subscribe";
import TherapistProfile from "../pages/therapist/TherapistProfile";
import EditTherapistProfile from "../pages/therapist/EditTherapistProfile";
import AssignedUsersChats from "../pages/therapist/AssignedUsersChats";
import TherapistChat from "../pages/therapist/TherapistChat";
import TherapistSessionsSummary from "../pages/therapist/SessionsSummary";
import TherapistSessionsList from "../pages/therapist/SessionsList";
import AssignTherapist from "../pages/admin/AssignTherapist";
import AppPasscode from "../pages/AppPasscode";
import EditTherapistProfileAdmin from "../pages/admin/EditTherapist";
import EmailVerification from "../pages/EmailVerification";
import SetMood from "../pages/user/SetMood";
import SetNote from "../pages/user/SetNote";
import Diary from "../pages/Diary";
import History from "../pages/History";
import TherapistProfileUser from "../pages/user/TherapistProfile";
import PatientBuyDonateSession from "../pages/user/BuyDonateSession";
import Forum from "../pages/Forum";
import ForumPost from "../pages/ForumPost";
import UserChat from "../pages/user/Chat";
import PatientChangeTherapistRequest from "../pages/user/ChangeTherapistRequest";
// import TherapistPatientDiary from "../pages/therapist/Diary";
// import TherapistPatientHistory from "../pages/therapist/History";
import TherapistPatientSetMood from "../pages/therapist/SetMood";
import TherapistPatientSetNote from "../pages/therapist/SetNote";
import PatientSessionsSummary from "../pages/user/SessionsSummary";
import AdminTherapistSessionsSummary from "../pages/admin/SessionsSummary";
import AdminTherapistSessionsList from "../pages/admin/SessionsList";
import UnassignedUsers from "../pages/therapist/UnassignedUsers";
import Contact from "../pages/Contact";
import About from "../pages/About";
//import RecieveCall from "../pages/RecieveCall";
import CallPage from "../pages/CallPage";
import Requests from "../pages/admin/Requests";
import Walkthrough from "../pages/Walkthrough";
import ActivityHistory from "../pages/ActivityHistory";
import PersonalChat from "../components/chat/ChatScreen/ChatScreen";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import PendingRequests from "../pages/PendingRequests";
import { createStackNavigator } from "react-navigation-stack";
import Terms from "../pages/Terms";

let navigationOptions = {
  animationEnabled: false
};

const MyApp = createStackNavigator(
  {
    CallPage: {
      screen: CallPage,
      navigationOptions
    },

    Home: {
      screen: Home,
      navigationOptions
    },
    ForgotPassword: {
      screen: ForgotPassword,
      navigationOptions
    },
    signupOptions: {
      screen: signupOptions,
      navigationOptions
    },
    signup: {
      screen: signup,
      navigationOptions
    },
    Walkthrough: {
      screen: Walkthrough,
      navigationOptions
    }
  },
  {
    initialRouteName: "Home",
    headerMode: "none"
  }
);

const MyAppTwo = createStackNavigator(
  {
    ActivityHistory: {
      screen: ActivityHistory,
      navigationOptions
    },
    ViewMood: {
      screen: ViewMood,
      navigationOptions
    },
    PrivacyPolicy: {
      screen: PrivacyPolicy,
      navigationOptions
    },
    Terms: {
      screen: Terms,
      navigationOptions
    },
    Requests: {
      screen: Requests,
      navigationOptions
    },
    About: {
      screen: About,
      navigationOptions
    },
    Contact: {
      screen: Contact,
      navigationOptions
    },
    PendingRequests: {
      screen: PendingRequests,
      navigationOptions
    },

    UnassignedUsers: {
      screen: UnassignedUsers,
      navigationOptions
    },
    // TherapistPatientDiary: {
    //   screen: TherapistPatientDiary,
    //   navigationOptions
    // },
    // TherapistPatientHistory: {
    //   screen: TherapistPatientHistory,
    //   navigationOptions
    // },
    TherapistPatientSetMood: {
      screen: TherapistPatientSetMood,
      navigationOptions
    },
    TherapistPatientSetNote: {
      screen: TherapistPatientSetNote,
      navigationOptions
    },
    UserChat: {
      screen: UserChat,
      navigationOptions
    },
    PersonalChat: {
      screen: PersonalChat,
      navigationOptions
    },
    // PersonalChatFirebase: {
    //   screen: PersonalChatFirebase,
    //   navigationOptions
    // },
    TherapistProfileUser: {
      screen: TherapistProfileUser,
      navigationOptions
    },
    Forum: {
      screen: Forum,
      navigationOptions
    },
    ForumPost: {
      screen: ForumPost,
      navigationOptions
    },
    History: {
      screen: History,
      navigationOptions
    },
    Diary: {
      screen: Diary,
      navigationOptions
    },
    Login: {
      screen: Login,
      navigationOptions
    },
    SetMood: {
      screen: SetMood,
      navigationOptions
    },
    SetNote: {
      screen: SetNote,
      navigationOptions
    },
    Dashboard: {
      screen: Dashboard,
      navigationOptions
    },
    // RecieveCall: {
    //   screen: RecieveCall,
    //   navigationOptions
    // },
    AdminUsers: {
      screen: AdminUsers,
      navigationOptions
    },
    PatientChat: {
      screen: PatientChat,
      navigationOptions
    },
    PatientProfile: {
      screen: PatientProfile,
      navigationOptions
    },
    PatientBuyDonateSession: {
      screen: PatientBuyDonateSession,
      navigationOptions
    },
    // PatientDiary: {
    //   screen: PatientDiary,
    //   navigationOptions
    // },
    PatientChangeTherapistRequest: {
      screen: PatientChangeTherapistRequest,
      navigationOptions
    },
    PatientSessionsSummary: {
      screen: PatientSessionsSummary,
      navigationOptions
    },
    Request1On1Session: {
      screen: Request1On1Session,
      navigationOptions
    },
    TherapistSessionsSummary: {
      screen: TherapistSessionsSummary,
      navigationOptions
    },
    TherapistSessionsList: {
      screen: TherapistSessionsList,
      navigationOptions
    },

    EditTherapistProfileAdmin: {
      screen: EditTherapistProfileAdmin,
      navigationOptions
    },
    AppPasscode: {
      screen: AppPasscode,
      navigationOptions
    },
    Subscribe: {
      screen: Subscribe,
      navigationOptions
    },
    AssignTherapist: {
      screen: AssignTherapist,
      navigationOptions
    },
    TherapistChat: {
      screen: TherapistChat,
      navigationOptions
    },
    EditTherapistProfile: {
      screen: EditTherapistProfile,
      navigationOptions
    },
    AddTherapist: {
      screen: AddTherapist,
      navigationOptions
    },
    TherapistProfile: {
      screen: TherapistProfile,
      navigationOptions
    },
    TherapistProfileAdmin: {
      screen: TherapistProfileAdmin,
      navigationOptions
    },
    AdminTherapists: {
      screen: AdminTherapists,
      navigationOptions
    },
    AdminTherapistConnectedUsers: {
      screen: AdminTherapistConnectedUsers,
      navigationOptions
    },
    PatientNotes: {
      screen: PatientNotes,
      navigationOptions
    },
    AssignedUsers: {
      screen: AssignedUsers,
      navigationOptions
    },
    AssignedUsersChats: {
      screen: AssignedUsersChats,
      navigationOptions
    },
    AdminChangeTherapistRequests: {
      screen: AdminChangeTherapistRequests,
      navigationOptions
    },
    AdminPaymentVerificationRequests: {
      screen: AdminPaymentVerificationRequests,
      navigationOptions
    },
    Admin1on1SessionRequests: {
      screen: Admin1on1SessionRequests,
      navigationOptions
    },
    AdminDonateSessionRequests: {
      screen: AdminDonateSessionRequests,
      navigationOptions
    },
    AdminTherapistSessionsList: {
      screen: AdminTherapistSessionsList,
      navigationOptions
    },
    AdminTherapistSessionsSummary: {
      screen: AdminTherapistSessionsSummary,
      navigationOptions
    },
    Settings: {
      screen: Settings,
      navigationOptions
    }
  },
  {
    initialRouteName: "Dashboard",
    headerMode: "none"
  }
);

const TabNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: MyApp,
      navigationOptions: {
        tabBarVisible: false
      }
    },
    Dashboard: {
      screen: MyAppTwo,
      navigationOptions: {
        tabBarVisible: false
      }
    },
    ResetPassword: {
      screen: ResetPassword,
      path: "reset-password/:token",
      navigationOptions: {
        tabBarVisible: false
      }
    },
    EmailVerification: {
      screen: EmailVerification,
      path: "email-verification",
      navigationOptions: {
        tabBarVisible: false
      }
    }
  },
  {
    initialRouteName: "Home"
  }
);

export default createAppContainer(TabNavigator);
