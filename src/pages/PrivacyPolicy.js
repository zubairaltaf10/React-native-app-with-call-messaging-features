import React, { Component } from "react";
import {
  View,
  Text,
  FlatList,
  BackHandler,
  Linking,
  Dimensions,
  Image
} from "react-native";
import { styles, theme } from "../styles";
import { ListItem, Icon } from "react-native-elements";
import Header from "../components/Header";
import LinearGradient from "react-native-linear-gradient";
import { pukaarContact, pukaarEmail } from "../util/constants";
import diseaseTypes from "../util/enums/diseaseTypes";
import session from "../data/session";
const { width, height } = Dimensions.get("window");
export default class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      worries: [
        {
          heading: "1.	About Your Privacy and This Privacy Policy",
          content:
            'Your privacy is of outmost importance to us. Our team is constantly working to ensure that no resource or tool is spared and that the greatest emphasis is laid on protecting privacy of our clients. This document serves as our "Privacy Policy" and herein are details on issues related to your privacy when you avail any of our services. It is intended to inform you of our policies, procedures and practices regarding the collection, use and disclosure of any information that you provide through the Platform. The Privacy Policy is part of our Terms and Conditions which can be found in our website. The terms in the Privacy Policy (such as, but not limited to, "we", "our", “us", "Platform", “Counselor", "Counselor Services" etc) have the same meaning as in our Terms and Conditions document. When you use our Platform you accept and agree to both the Terms and Conditions and to the Privacy Policy. If you do not agree to be bound to the Privacy Policy you should stop using the Platform immediately. By accessing and using our Platform you affirm that you have read the Terms and Conditions and the Privacy Policy and that you understand, agree and acknowledge all the terms contained in both of them. '
        },
        {
          heading: "2.	Information Collection, Use, and Disclosure",
          content:
            'In order for us to operate the Platform effectively and ensure that you can use the Platform, including(but not limited to) the Counselor Services, we may have to collect your personally identifiable information (such as, but not limited to, your name, phone number, email address, and address), billing and payment information, profile information, log data (information such as your computer, Internet Protocol address (“IP”), pages that you visit and the amount of time spent on those pages, actions you take and other statistics), information related to the Counselor Services or your need for Counselor Services, and any information which is exchanged between you and your Counselor (collectively the "Information"). In some cases, some of the Information that you give to us is considered health related data. You may decide which Information, if any, you would like to share with us, but some functions of the Platform may not be available to you without providing us the necessary Information. By deciding to provide the Information you agree to our methods of collections and use, as well to other terms and provisions of this Privacy Policy. Protecting this Information is our outmost priority. We will never sell or rent any Information you shared in the Platform. Other than in the limited ways detailed in this Privacy Policy, we will never use or disclose any Information unless you specifically and explicitly requested or approved us to do so The Information may be used for the following purposes:\no To register and create your account on our Platform and ensure that you can log in to your account and use the Platform.\no To manage your account, provide you with customer support, and ensure you are receiving services up to our quality standards.\no To contact you or provide you with information, alerts and suggestions that are related to the service.\no Billing-related purposes.\no To reach out to you, either ourselves or using the appropriate authorities, if either we or a Counselor have a good reason to believe that you or any other person may be in danger or may be either the cause or the victim of a criminal act.\no To appropriately match you with a Counselor.\no To enable and facilitate the Counselor Services.\no To supervise, administer and monitor the service.\no To measure and improve the quality, the effectiveness and the delivery of our services. '
        },
        {
          heading: "3.	Cookies and Web Beacons",
          content:
            'Like many websites, we use "cookies" and "web beacons" to collect information. A "cookie" is a small data file that is transferred to your computer\'s hard disk for record-keeping purposes. A "web beacon" is a tiny image, placed on a Web page or email that can report your visit or use. We use cookies and web beacons to enable the technical operation of the Platform, to administer your log-in to your account and to collect the Log Data. You can change your browser\'s settings so it will stop accepting cookies or to prompt you before accepting a cookie. However, if you do not accept cookies you may not be able to use the Platform. The Platform may also include the use of cookies and web beacons of services owned or provided by third parties that are not covered by our Privacy Policy and we do not have access or control over these cookies and web beacons. We may also use third party cookies for the purposes of web analytics, attribution and error management. '
        },
        {
          heading: "4.	Social and General Information Tools",
          content:
            'We use several publicly-available tools and information exchange resources, such as (but not limited to) a blog, a Facebook page, a Twitter account, and others (collectively "Social and General Information Tools"). Any information you provide or share while using Social and General Information Tools may be read, accessed, and collected by that site and users of that site according to their Privacy Policy. '
        },
        {
          heading: "5.	Phishing",
          content:
            'Online identity theft and account hacking, including the practice currently known as "phishing", are of great concern. You should always be diligent when you are being asked for your account information and you must always make sure you do that in our secure system. We will never request your login information or your credit card information in any non-secure or unsolicited communication (email, phone or otherwise). '
        },
        {
          heading: "6.	Links",
          content:
            "The Platform may contain links to other websites, services or offers which are owned, operated or maintained by third parties. If you click on a third party link, you will be directed to that third website or service. The fact that we link to a website or service is not an endorsement, authorization or representation of our affiliation with that third party, nor is it an endorsement of their privacy or information security policies or practices. We do not have control over third party websites and services and we do not have control over their privacy policies and terms of use.   "
        },
        {
          heading: "7.	Security",
          content:
            "While using any Internet-based service carries inherent security risks that cannot be 100% prevented, our systems, infrastructure, encryption technology, operation and processes are all designed, built and maintained with your security and privacy in mind. We apply industry standards and best practices to prevent any unauthorized access, use, and disclosure. We comply with or exceed all applicable federal laws, state laws, and regulations regarding data privacy.   "
        },
        {
          heading: "8.	Service Providers",
          content:
            "We may employ third party companies and individuals to facilitate our Platform, to perform certain tasks which are related to the Platform, or to provide audit, legal, operational or other services for us. These tasks include, but not limited to, customer service, technical maintenance, monitoring, email management and communication, database management, billing and payment processing, reporting and analytics. We will share with them only the minimum necessary information to perform their task for us and only after entering into appropriate confidentiality agreement. "
        },
        {
          heading: "9.	Children's Privacy",
          content:
            "We do not knowingly collect or solicit any information from anyone under the age of 13 or knowingly allow such persons to become our user. The Platform is not directed and not intended to be used by children under the age of 13. If you are aware that we have collected Personal Information from a child under age 13 please let us know by contacting us and we will delete that information. "
        },
        {
          heading: "10.	International Transfer",
          content:
            "We do not knowingly collect or solicit any information from anyone under the age of 13 or knowingly allow such persons to become our user. The Platform is not directed and not intended to be used by children under the age of 13. If you are aware that we have collected Personal Information from a child under age 13 please let us know by contacting us and we will delete that information. "
        },
        {
          heading: "11.	Compliance with Laws and Law Enforcement",
          content:
            "Your information may be transferred to — and maintained on — computers located inside our state. Regardless of where your data is stored, it will be maintained securely as outlined in this policy. Your consent to our Terms and Conditions followed by your submission of such information represents your agreement to such transfers. "
        },
        {
          heading: "12.	General Data Protection Regulation (GDPR) Notice",
          content:
            "This section provides additional information PrivacyPolicy our Privacy Policy relevant to users from the European Union. It is necessary for us to use your personal information:\no To perform our obligations in accordance with any contract that we may have with you.\no It is in our legitimate interest or a third party's legitimate interest to use personal information in such a way to ensure that we provide the Services in the best way that we can.\no It is our legal obligation to use your personal information to comply with any legal obligations imposed upon us. You can view and edit any personal data that you have provided to us using this App. Automated processing of your Personal Information is necessary to operate the Platform effectively and to provide counseling and related services. Pukaar is the Controller with respect to your Personal Data. You can contact our Data Protection Officer with questions, concerns or objections PrivacyPolicy this policy, or PrivacyPolicy your data by writing to: Pukaarcommunity@gmail.com Lahore, Pakistan "
        },
        {
          heading: "13.	Changes to the Privacy Policy",
          content:
            'Your privacy is of outmost importance to us. Our team is constantly working to ensure that no resource or tool is spared and that the greatest emphasis is laid on protecting privacy of our clients. This document serves as our "Privacy Policy" and herein are details on issues related to your privacy when you avail any of our services. It is intended to inform you of our policies, procedures and practices regarding the collection, use and disclosure of any information that you provide through the Platform. The Privacy Policy is part of our Terms and Conditions which can be found in our website. The terms in the Privacy Policy (such as, but not limited to, "we", "our", “us", "Platform", “Counselor", "Counselor Services" etc) have the same meaning as in our Terms and Conditions document. When you use our Platform you accept and agree to both the Terms and Conditions and to the Privacy Policy. If you do not agree to be bound to the Privacy Policy you should stop using the Platform immediately. By accessing and using our Platform you affirm that you have read the Terms and Conditions and the Privacy Policy and that you understand, agree and acknowledge all the terms contained in both of them. '
        },
        {
          heading: "14.	Contacting us",
          content:
            'If you have any questions or concerns PrivacyPolicy this Privacy Policy or our privacy-related practices, please contact us by clicking the "Contact" link in our menu on our app or social media. '
        },
        { heading: "", content: "Last Updated: November - 2018 \n" }
      ]
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.props.navigation.goBack(null);
    return true;
  };

  goBack = () => {
    this.props.navigation.navigate("Settings");
  };

  logout = () => {
    session.loggingOut();
    this.props.navigation.navigate("Login", { update: true });
  };

  displayDiseaseList = () => {
    let arr = [];
    for (let k in diseaseTypes) {
      // diseaseTypes[k]
      arr.push(diseaseTypes[k]);
    }
    return arr.map((disease, i) => {
      return <Text key={i}>- {disease}</Text>;
    });
  };

  render() {
    return (
      <View style={styles.fillSpace}>
        <Header
          title={"Privacy Policy"}
          changeDrawer={this.goBack}
          icon={"arrow-back"}
          logout={this.logout}
          customStyles={{
            height: (76 * Dimensions.get("window").height) / 896
          }}
        />

        <View
          style={{ flex: 1, width: "90%", justifyContent: "space-between" }}
        >
          <View
            style={{ height: "100%", marginTop: theme.size(20), marginLeft: 5 }}
          >
            <FlatList
              showsVerticalScrollIndicator={false}
              data={this.state.worries}
              // numColumns={3}
              // columnWrapperStyle={{
              //   // marginHorizontal: 10,
              //   // paddingHorizontal: 20,
              //   alignSelf: "center"
              //   // flex: 1,
              // }}
              contentContainerStyle={{
                // marginHorizontal: 10,
                // padding: 20,
                alignSelf: "center"
                // justifyContent: 'space-between',
              }}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: theme.colorAccent,
                    // margin: 10,
                    // width: width * 0.25,
                    // height: width * 0.25,
                    justifyContent: "center",
                    // alignItems: "center",
                    borderRadius: 5,
                    elevation: 0.15
                  }}
                >
                  <Text
                    style={[
                      styles.subtitle,
                      {
                        // fontSize: 12,
                        textAlign: "left",
                        // marginVertical: 20,
                        color: theme.colorGrey,
                        fontFamily: theme.font.bold,
                        marginTop: 20,
                        marginBottom: 5
                      }
                    ]}
                  >
                    {item.heading}
                    {/* {this.displayDiseaseList()} */}
                  </Text>
                  <Text
                    style={[
                      styles.subtitle,
                      {
                        // fontSize: 12,
                        textAlign: "justify",
                        marginBottom: 20,
                        color: theme.colorGrey,
                        fontFamily: theme.font.medium
                      }
                    ]}
                  >
                    {item.content}
                    {/* {this.displayDiseaseList()} */}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </View>
    );
  }
}
