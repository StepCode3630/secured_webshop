const app = Vue.createApp({
  data() {
    return {
      username: "",
      email: "",
      password: "",
      address: "",
      file: null,
      errorMessage: "",
      successMessage: "",
      strength: 0,
      strengthLabel: "Aucun",
      strengthColor: "#ccc",
    };
  },
  methods: {
    handleFile(e) {
      this.file = e.target.files[0];
    },
    updateStrength() {
      const p = this.passwordStrength;
      this.strength = p.score;
      this.strengthLabel = p.label;
      this.strengthColor = p.color;
    },
    async handleRegister() {
      const apiUrl = "/api/auth/register";

      const password = this.password;

      const rules = {
        length: password.length >= 8,
        lower: /[a-z]/.test(password),
        upper: /[A-Z]/.test(password),
        digit: /[0-9]/.test(password),
      };

      const meets = rules.length && rules.lower && rules.upper && rules.digit;

      if (!meets) {
        this.errorMessage = "Mets un meilleur mot de passe (min fort)";
        this.successMessage = "";
        return;
      }

      const formData = new FormData();
      formData.append("username", this.username);
      formData.append("email", this.email);
      formData.append("password", this.password);
      formData.append("address", this.address);
      if (this.file) {
        formData.append("photo", this.file);
      }

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          this.successMessage = "Compte créé !";
          window.location.href = "/login";
        } else {
          this.errorMessage = data.error;
        }
      } catch (err) {
        this.errorMessage = "Erreur serveur";
        console.error(err);
      }
    },
  },

  computed: {
    // individual rule checks for the UI checklist
    passwordRules() {
      const password = this.password || "";
      return {
        length: password.length >= 8,
        lower: /[a-z]/.test(password),
        upper: /[A-Z]/.test(password),
        digit: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
      };
    },
    passwordStrength() {
      const password = this.password;

      if (!password) {
        return {
          score: 0,
          label: "Aucun :(",
          color: "#ccc",
        };
      }

      if (
        password.length > 16 &&
        this.passwordRules.length &&
        this.passwordRules.lower &&
        this.passwordRules.upper &&
        this.passwordRules.digit &&
        this.passwordRules.special
      ) {
        return { score: 5, label: "Divin", color: "#7b1abcff" };
      }

      const rules = [
        password.length >= 8,
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^A-Za-z0-9]/.test(password),
      ];

      const score = rules.filter(Boolean).length;

      const levels = [
        { label: "Très faible", color: "#ff4d4d" },
        { label: "Faible", color: "#ff884d" },
        { label: "Moyen", color: "#ffd24d" },
        { label: "Bon", color: "#9acd32" },
        { label: "Fort", color: "#2ecc71" },
        { label: "Excellent", color: "#27ae60" },
      ];

      return {
        score,
        label: levels[score]?.label || "Très faible",
        color: levels[score]?.color || "#ff4d4d",
      };
    },
  },
});
