/**
 * CareerOS Form Detection & Autofill Module
 * Modular form field detector and filler for external job applications (Greenhouse, Lever, Workday, etc.)
 */

(function () {
  const SENSITIVE_KEYWORDS = [
    "gender",
    "race",
    "ethnicity",
    "veteran",
    "disability",
    "handicap",
    "sexual orientation",
    "sponsorship",
    "visa",
    "authorized to work",
    "legally authorized",
    "require sponsorship",
    "felony",
    "criminal",
    "convict",
    "salary",
    "compensation",
    "desired pay",
    "expected pay",
    "ssn",
    "social security",
    "passport",
    "driver license",
    "eeo",
    "equal opportunity",
    "demographic",
    "consent",
    "agree to terms",
    "signature",
  ];

  const FIELD_DEFINITIONS = [
    {
      category: "firstName",
      label: "First Name",
      patterns: [/first.*name/i, /given.*name/i, /^fname/i, /forename/i],
    },
    {
      category: "lastName",
      label: "Last Name",
      patterns: [/last.*name/i, /family.*name/i, /sur.*name/i, /^lname/i],
    },
    {
      category: "fullName",
      label: "Full Name",
      patterns: [/^name$/i, /full.*name/i, /applicant.*name/i, /candidate.*name/i, /your.*name/i],
    },
    {
      category: "email",
      label: "Email Address",
      patterns: [/email/i, /e-mail/i],
    },
    {
      category: "phone",
      label: "Phone Number",
      patterns: [/phone/i, /mobile/i, /cell/i, /tel(ephone)?/i, /contact.*number/i],
    },
    {
      category: "location",
      label: "Location / City",
      patterns: [/location/i, /city/i, /address/i, /residence/i, /postal/i, /zip/i],
    },
    {
      category: "linkedin",
      label: "LinkedIn Profile",
      patterns: [/linkedin/i],
    },
    {
      category: "github",
      label: "GitHub Profile",
      patterns: [/github/i],
    },
    {
      category: "portfolio",
      label: "Portfolio / Website",
      patterns: [/portfolio/i, /personal.*site/i, /website/i, /blog/i, /personal.*url/i],
    },
    {
      category: "currentCompany",
      label: "Current Company",
      patterns: [/current.*company/i, /present.*employer/i, /most.*recent.*company/i],
    },
    {
      category: "currentTitle",
      label: "Current Title / Role",
      patterns: [/current.*(job.*)?title/i, /current.*role/i, /headline/i],
    },
    {
      category: "summary",
      label: "Summary / Note",
      patterns: [/summary/i, /bio/i, /cover.*letter/i, /note.*to.*recruiter/i, /additional.*info/i, /about.*yourself/i],
    },
  ];

  function getFieldText(element) {
    const pieces = [];

    // 1. Associated label via 'for'
    if (element.id) {
      const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
      if (label) pieces.push(label.innerText || label.textContent);
    }

    // 2. Enclosing label
    const parentLabel = element.closest("label");
    if (parentLabel) {
      pieces.push(parentLabel.innerText || parentLabel.textContent);
    }

    // 3. aria-label and aria-labelledby
    if (element.getAttribute("aria-label")) {
      pieces.push(element.getAttribute("aria-label"));
    }
    const labelledby = element.getAttribute("aria-labelledby");
    if (labelledby) {
      const lblEl = document.getElementById(labelledby);
      if (lblEl) pieces.push(lblEl.innerText || lblEl.textContent);
    }

    // 4. Attributes: placeholder, name, id
    if (element.placeholder) pieces.push(element.placeholder);
    if (element.name) pieces.push(element.name);
    if (element.id) pieces.push(element.id);

    // 5. Previous sibling label/span text
    const prev = element.previousElementSibling;
    if (prev && (prev.tagName === "LABEL" || prev.tagName === "SPAN" || prev.tagName === "P")) {
      pieces.push(prev.innerText || prev.textContent);
    }

    return pieces.join(" ").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function isFieldSensitive(text) {
    return SENSITIVE_KEYWORDS.some((kw) => text.includes(kw));
  }

  function classifyField(element) {
    const text = getFieldText(element);
    if (!text) return null;

    if (isFieldSensitive(text)) {
      return {
        category: "sensitive",
        label: "Sensitive Field",
        isSensitive: true,
        text,
      };
    }

    // Match input type first
    if (element.type === "email") {
      return { category: "email", label: "Email Address", isSensitive: false, text };
    }
    if (element.type === "tel") {
      return { category: "phone", label: "Phone Number", isSensitive: false, text };
    }

    // Match patterns
    for (const def of FIELD_DEFINITIONS) {
      for (const pattern of def.patterns) {
        if (pattern.test(text)) {
          return {
            category: def.category,
            label: def.label,
            isSensitive: false,
            text,
          };
        }
      }
    }

    return null;
  }

  function detectFormFields() {
    // Select all potential form inputs on the page
    const candidates = Array.from(
      document.querySelectorAll(
        "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']):not([type='file']), textarea, select"
      )
    );

    const detected = [];
    const seenCategories = new Set();

    candidates.forEach((el, index) => {
      // Ignore hidden or disabled elements
      if (el.disabled || el.type === "checkbox" || el.type === "radio") return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return; // not visible

      const classification = classifyField(el);
      if (!classification) return;

      const currentValue = el.value || "";

      detected.push({
        id: `field_${index}`,
        element: el,
        category: classification.category,
        label: classification.label,
        isSensitive: classification.isSensitive,
        currentValue: currentValue.trim(),
        hasExistingValue: Boolean(currentValue.trim()),
        descriptorText: classification.text,
      });

      seenCategories.add(classification.category);
    });

    return {
      fields: detected,
      hasForm: detected.length > 0,
      fillableFields: detected.filter((f) => !f.isSensitive),
      sensitiveFields: detected.filter((f) => f.isSensitive),
    };
  }

  function mapUserDataToFields(detectedFields, profile, resume) {
    const rawName = profile?.fullName || "";
    const nameParts = rawName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    const email = profile?.email || resume?.extractedData?.email || "";
    const phone = resume?.extractedData?.phone || "";
    const location = resume?.extractedData?.location || (resume?.experience?.[0]?.location) || "";
    const linkedin = resume?.extractedData?.linkedin || "";
    const github = resume?.extractedData?.github || "";
    const portfolio = resume?.extractedData?.portfolio || resume?.projects?.[0]?.url || "";
    const currentCompany = resume?.experience?.[0]?.company || "";
    const currentTitle = resume?.experience?.[0]?.role || resume?.title || "";
    const summary = resume?.summary || "";

    const valueMap = {
      firstName,
      lastName,
      fullName: rawName,
      email,
      phone,
      location,
      linkedin,
      github,
      portfolio,
      currentCompany,
      currentTitle,
      summary,
    };

    return detectedFields.map((field) => {
      if (field.isSensitive) {
        return {
          ...field,
          proposedValue: "",
          status: "MANUAL_INPUT_REQUIRED",
          statusNote: "Sensitive question (Requires manual answer)",
        };
      }

      const proposed = valueMap[field.category] || "";
      let status = "READY";
      let statusNote = "Ready to fill";

      if (!proposed) {
        status = "NO_DATA";
        statusNote = "No verified data in profile";
      } else if (field.hasExistingValue) {
        status = "PRESERVED";
        statusNote = "Already filled (will preserve unless overwritten)";
      }

      return {
        ...field,
        proposedValue: proposed,
        status,
        statusNote,
      };
    });
  }

  function fillField(field, value, overwriteExisting = false) {
    if (!field?.element || !value) return false;
    const el = field.element;

    if (field.hasExistingValue && !overwriteExisting) {
      return false; // Safely preserve user-entered values
    }

    try {
      el.focus();
      if (el.tagName === "SELECT") {
        let matched = false;
        const normVal = value.toLowerCase().trim();
        for (let i = 0; i < el.options.length; i++) {
          const opt = el.options[i];
          if (
            opt.value.toLowerCase().trim() === normVal ||
            opt.text.toLowerCase().trim().includes(normVal)
          ) {
            el.selectedIndex = i;
            matched = true;
            break;
          }
        }
        if (!matched && el.options.length > 0) {
          el.value = value;
        }
      } else {
        el.value = value;
      }

      // Fire events for framework change listeners
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.blur();
      return true;
    } catch (err) {
      console.warn("CareerOS field fill error:", err);
      return false;
    }
  }

  // Export to window.__careerOSFormDetector for content.js
  window.__careerOSFormDetector = {
    detectFormFields,
    mapUserDataToFields,
    fillField,
  };
})();
