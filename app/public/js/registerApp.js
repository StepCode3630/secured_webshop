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

      // Validate password policy before sending
      const rules = this.passwordRules;
      const meets = rules.length && rules.lower && rules.upper && rules.digit;
      if (!meets) {
        this.errorMessage =
          "Le mot de passe ne respecte pas la politique minimale (8 caractères, minuscules, MAJUSCULES et chiffres).";
        this.successMessage = "";
        return;
      }

      const formData = new FormData();
      formData.append("username", this.username);
      formData.append("email", this.email);
      formData.append("password", this.password);
      formData.append("address", this.address);
      formData.append("photo", this.file);

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          this.successMessage = "Compte créé !";
          this.errorMessage = "";

          // redirection
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
          label: "Aucun",
          color: "#ccc",
        };
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
      ];

      return {
        score,
        label: levels[score]?.label || "Très faible",
        color: levels[score]?.color || "#ff4d4d",
      };
    },
  },
});
