<template>
  <form
    id="my-form"
    action="/api/test_form_data"
    method="post"
    @submit.prevent="testForm('formData')"
  >
    <h1>Test CSRF <small>with FormData or JSON form</small></h1>
    <input v-model="form.full_name" name="full_name" type="text" />
    <input
      v-show="false"
      v-model="form['csrf-token']"
      name="csrf-token"
      type="text"
    />
    <button type="submit">POST /test (FORMDATA - AJAX)</button>
    <button @click.prevent="testForm()">POST /test (JSON - AJAX)</button>
    <br />
    <br />
    <pre v-if="msg" :style="{ color: msgColor }">{{ msg }}</pre>
  </form>
</template>

<script setup lang="ts">
import { useNuxtApp } from "nuxt/app";
import { ref, reactive, onMounted, computed } from "vue";

const { $csrf } = useNuxtApp();

const form = reactive({
  full_name: "Ndianabasi",
  "csrf-token": "",
});

const formData = computed(() => {
  const formData = new FormData();
  formData.set("full_name", form.full_name);
  formData.set("csrf-token", form["csrf-token"]);
  return formData;
});

onMounted(() => {
  // @ts-ignore
  form["csrf-token"] = $csrf || "";
});

const msg = ref<any>(null);
const msgColor = ref("green");
const testForm = async function (type?: "formData") {
  const isFormData = type === "formData";

  msg.value = null;
  msgColor.value = "green";
  let error;

  const data = await $fetch("/api/test", {
    method: "POST",
    headers: { "test-header": "ok" },
    credentials: "same-origin",
    body: isFormData ? formData.value : form,
  }).catch(({ data }) => {
    error = data;
    return null;
  });
  msg.value = data || error;
  if (error) {
    msgColor.value = "red";
  }
};
</script>
