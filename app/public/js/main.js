const app = Vue.createApp({
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      successMessage: "",
    };
  },
  methods: {
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
        if (response.ok) {
          this.successMessage = data.message;
          this.errorMessage = "";
          // Redirect or something
          window.location.href = "/profile"; // assuming after login go to profile
        } else {
          this.errorMessage = data.error;
          this.successMessage = "";
        }
      } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        this.errorMessage = "Une erreur est survenue. Veuillez réessayer.";
        this.successMessage = "";
      }
    },
  },
});
