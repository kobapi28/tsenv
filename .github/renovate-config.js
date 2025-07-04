module.exports = {
  extends: [
    "config:recommended",
    "schedule:weekends",
    ":semanticCommitTypeAll(chore)",
  ],
  timezone: "Asia/Tokyo",
  labels: ["dependencies"],
  packageRules: [
    {
      matchUpdateTypes: ["major"],
      labels: ["dependencies", "major"],
    },
    {
      matchUpdateTypes: ["minor"],
      labels: ["dependencies", "minor"],
    },
    {
      matchUpdateTypes: ["patch"],
      labels: ["dependencies", "patch"],
      automerge: true,
    },
    {
      matchDepTypes: ["devDependencies"],
      labels: ["dependencies", "devDependencies"],
    },
    {
      matchManagers: ["npm"],
      rangeStrategy: "bump",
    },
  ],
  prConcurrentLimit: 10,
  prHourlyLimit: 2,
  automerge: false,
  automergeType: "pr",
  automergeStrategy: "squash",
  platformAutomerge: false,
  semanticCommits: "enabled",
  semanticCommitType: "chore",
  semanticCommitScope: "deps",
  commitMessagePrefix: "chore(deps):",
  commitMessageTopic: "{{depName}}",
  commitMessageExtra: "to {{newVersion}}",
  vulnerabilityAlerts: {
    labels: ["security"],
    automerge: false,
  },
  postUpdateOptions: ["npmDedupe"],
  npm: {
    minimumReleaseAge: "3 days",
  },
};
