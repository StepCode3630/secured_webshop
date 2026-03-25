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
        if (response.ok) {
          this.successMessage = data.message;
          this.errorMessage = "";
          const user = data.user;
          console.log("Utilisateur connecté :", user, user && user.id);
          if (user && user.id) {
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = `/profile?id=${encodeURIComponent(user.id)}`;
          } else {
            window.location.href = "/profile";
          }
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
