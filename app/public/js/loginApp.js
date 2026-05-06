const app = Vue.createApp({
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      successMessage: "",
      loading: false,
      errorMessage: "",
      successMessage: "",
    };
  },
  methods: {
    //Send login request to API
    async handleSubmit() {
      const apiUrl = "/api/auth/login";
      try {
        //Envoie de la requête de connexion à l'API
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          switch (data.code) {
            case "MISSING_FIELDS":
              this.errorMessage = "Email et mot de passe requis";
              break;
            case "INVALID_CREDENTIALS":
              this.errorMessage = "Identifiants invalides";
              break;
            case "TOO_MANY_REQUESTS":
              this.errorMessage =
                "Trop de tentatives, réessaye dans une minute";
              break;
            default:
              this.errorMessage =
                "Une erreur est survenue. Veuillez réessayer.";
          }

          // this.successMessage = "Connextion réussie ! Redirection en cours...";

          if (data.retryAfter) {
            let seconds = data.retryAfter;

            const interval = setInterval(() => {
              this.errorMessage = `Trop de tentatives, réessaye dans ${seconds} secondes`;
              seconds--;

              if (seconds < 0) {
                clearInterval(interval);
                this.errorMessage = "";
              }
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        this.errorMessage = "Une erreur est survenue. Veuillez réessayer.";
        this.successMessage = "";
      }
    },
  },
});
