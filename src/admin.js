(function attachAdminModeration(globalScope) {
  "use strict";

  function createAdminStore() {
    return {
      admins: [
        { id: "admin-1", name: "Marketplace Admin", email: "admin@ghanafx.example", role: "admin" }
      ],
      actions: [],
      nextActionNumber: 1
    };
  }

  function getAdmin(store, adminId) {
    return store.admins.find((admin) => admin.id === adminId && admin.role === "admin") || null;
  }

  function findBureau(bureaus, bureauId) {
    return bureaus.find((bureau) => bureau.id === bureauId) || null;
  }

  function recordAction(store, adminId, type, targetId, details = "") {
    const action = {
      id: `admin-action-${store.nextActionNumber}`,
      adminId,
      type,
      targetId,
      details,
      createdAt: new Date().toISOString()
    };

    store.nextActionNumber += 1;
    store.actions.push(action);
    return action;
  }

  function ensureAdmin(store, adminId) {
    const admin = getAdmin(store, adminId);

    if (!admin) {
      return { ok: false, error: "Admin access is required." };
    }

    return { ok: true, admin };
  }

  function verifyBureau({ adminStore, bureaus, adminId, bureauId, verified }) {
    const permission = ensureAdmin(adminStore, adminId);
    const bureau = findBureau(bureaus, bureauId);

    if (!permission.ok) {
      return permission;
    }

    if (!bureau) {
      return { ok: false, error: "Bureau profile was not found." };
    }

    bureau.verified = Boolean(verified);
    const action = recordAction(
      adminStore,
      adminId,
      bureau.verified ? "verify-bureau" : "unverify-bureau",
      bureauId
    );

    return { ok: true, bureau, action };
  }

  function moderateBureauProfile({ adminStore, bureaus, adminId, bureauId, updates }) {
    const permission = ensureAdmin(adminStore, adminId);
    const bureau = findBureau(bureaus, bureauId);

    if (!permission.ok) {
      return permission;
    }

    if (!bureau) {
      return { ok: false, error: "Bureau profile was not found." };
    }

    ["name", "city", "area", "phone", "email"].forEach((field) => {
      const value = String(updates[field] || "").trim();
      if (value) {
        bureau[field] = value;
      }
    });

    const action = recordAction(adminStore, adminId, "moderate-profile", bureauId);

    return { ok: true, bureau, action };
  }

  function disableBureauAccount({ adminStore, bureaus, adminId, bureauId, disabled }) {
    const permission = ensureAdmin(adminStore, adminId);
    const bureau = findBureau(bureaus, bureauId);

    if (!permission.ok) {
      return permission;
    }

    if (!bureau) {
      return { ok: false, error: "Bureau profile was not found." };
    }

    bureau.disabled = Boolean(disabled);
    const action = recordAction(
      adminStore,
      adminId,
      bureau.disabled ? "disable-bureau" : "enable-bureau",
      bureauId
    );

    return { ok: true, bureau, action };
  }

  function resolveReport({ adminStore, trustStore, adminId, reportId, resolution = "resolved" }) {
    const permission = ensureAdmin(adminStore, adminId);

    if (!permission.ok) {
      return permission;
    }

    const report = trustStore.reports.find((candidate) => candidate.id === reportId);

    if (!report) {
      return { ok: false, error: "Report was not found." };
    }

    report.status = resolution;
    report.resolvedAt = new Date().toISOString();
    const action = recordAction(adminStore, adminId, "resolve-report", reportId, resolution);

    return { ok: true, report, action };
  }

  function getAdminQueue({ adminStore, trustStore, adminId }) {
    const permission = ensureAdmin(adminStore, adminId);

    if (!permission.ok) {
      return permission;
    }

    return {
      ok: true,
      reports: trustStore.reports.filter((report) => report.status === "open"),
      actions: [...adminStore.actions].reverse()
    };
  }

  const admin = {
    createAdminStore,
    disableBureauAccount,
    getAdminQueue,
    moderateBureauProfile,
    verifyBureau,
    resolveReport
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = admin;
  }

  globalScope.AdminModeration = admin;
})(typeof globalThis !== "undefined" ? globalThis : window);
