<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { CircleNotch } from "phosphor-svelte";
  import { onMount } from "svelte";

  /**
   * OAuth Callback Handler
   * 
   * Better Auth automatically handles the OAuth callback and sets the session.
   * This page just reads the stored redirect URL and navigates there.
   */

  let status = $state<"processing" | "success" | "error">("processing");
  let errorMessage = $state("");

  onMount(async () => {
    const providerError = new URLSearchParams(window.location.search).get("error");
    if (providerError) {
      status = "error";
      errorMessage = `Authentication failed: ${providerError.replaceAll("_", " ")}`;
      return;
    }

    try {
      const { data: session, error } = await authClient.getSession();
      if (error || !session?.user) {
        status = "error";
        errorMessage = error?.message || "Authentication failed. Please try again.";
        return;
      }

      const savedRedirect = localStorage.getItem("auth_redirect_after_oauth");
      localStorage.removeItem("auth_redirect_after_oauth");
      const targetUrl = savedRedirect?.startsWith("/") && !savedRedirect.startsWith("//")
        ? savedRedirect
        : "/";
      status = "success";
      window.location.assign(targetUrl);
    } catch (err) {
      status = "error";
      errorMessage = err instanceof Error ? err.message : "Authentication failed. Please try again.";
    }
  });
</script>

<svelte:head>
  <title>Completing Sign In - Billwave</title>
</svelte:head>

<div class="min-h-screen bg-bg-primary flex items-center justify-center p-4">
  <div class="w-full max-w-md text-center">
    {#if status === "processing"}
      <div class="flex flex-col items-center gap-4 py-8">
        <CircleNotch size={48} class="animate-spin text-accent" />
        <h1 class="text-xl font-display font-bold text-text-primary">
          Completing sign in...
        </h1>
        <p class="text-sm text-text-muted">
          Please wait while we finish authenticating you.
        </p>
      </div>
    {:else if status === "error"}
      <div class="bg-bg-card border border-border rounded-lg p-8 shadow-sm">
        <div class="w-16 h-16 rounded-full bg-error-bg flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-xl font-display font-bold text-text-primary mb-2">
          Sign in failed
        </h1>
        <p class="text-sm text-text-muted mb-6">
          {errorMessage}
        </p>
        <a href="/login" class="btn btn-primary w-full">
          Try Again
        </a>
      </div>
    {/if}
  </div>
</div>
