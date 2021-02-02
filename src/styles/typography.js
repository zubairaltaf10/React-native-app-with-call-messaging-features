import variables from "./variables";

export default {
  bold: { fontFamily: variables.font.bold },
  medium: { fontFamily: variables.font.medium },

  h1: {
    fontFamily: variables.font.medium,
    fontSize: variables.fontSize(18),
    marginBottom: variables.size(6),
    color: variables.colorMenuText
  },
  h2: {
    fontFamily: variables.font.medium,
    fontSize: variables.fontSize(16),
    marginBottom: variables.size(6),
    color: variables.colorMenuText
  },
  title: {
    fontFamily: variables.font.regular,
    fontSize: variables.fontSize(14),
    color: variables.colorMenuText
  },
  subtitle: {
    fontFamily: variables.font.regular,
    fontSize: variables.fontSize(12),
    color: variables.colorMenuText
  },
  subtitleLimit: {
    fontFamily: variables.font.regular,
    fontSize: variables.fontSize(10),
    color: variables.colorMenuText
  },
  bodyText: {
    fontFamily: variables.font.medium,
    fontSize: variables.fontSize(14),
    color: variables.colorMenuText
  },

  /** Elements */
  buttonText: {
    fontFamily: variables.font.medium,
    textTransform: "capitalize",
    alignSelf: "center"
  },
  buttonTextSimple: {
    // Plain text without background
    fontFamily: variables.font.bold,
    color: variables.colorAccent,
    textTransform: "capitalize"
  },
  inputLabel: {
    fontFamily: variables.font.medium,
    fontSize: variables.fontSize(14),
    textAlign: "left"
  },
  label: {
    fontFamily: variables.font.medium,
    fontSize: variables.fontSize(10),
    color: variables.colorTextLight
  },
  toolbarText: {
    fontFamily: variables.font.medium,
    fontSize: variables.fontSize(16)
  },

  listTitle: {
    fontFamily: variables.font.medium,
    fontSize: variables.fontSize(16),
    textAlign: "left"
  }
};
