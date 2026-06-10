export const M = {
  welcome: "Link your paid Tokmizer account.",
  needToken: "Tokmizer already works for free on this device. Linking is only to attach a paid plan.",
  getToken: "Subscribe at tokmizer.com/#pricing, then grab your key from your dashboard.",
  askToken: "Paste your dashboard key, then press Enter:",
  activating: "Linking...",
  activated: (plan: string) => `Linked. You are on the ${plan} plan.`,
  failed: (reason: string) => `Activation failed: ${reason}`,
  trialEnded: "Your trial has ended. Renew at tokmizer.com/dashboard/billing",
  suspended: (why: string) => `Your token is suspended. ${why}`,
  revoked: "Your token has been revoked. Contact support at tokmizer.com/contact",
  rotated: "Token rotated. Paste your new token from tokmizer.com/dashboard/token",
  offline: "Network required. Tokmizer needs an internet connection.",
  deviceCap: "Device limit reached. Manage devices at tokmizer.com/dashboard/devices"
};
