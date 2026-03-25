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
    };
  },
  methods: {
    handleFile(e) {
      this.file = e.target.files[0];
    },

    async handleRegister() {
      const apiUrl = "/api/auth/register";

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
});
