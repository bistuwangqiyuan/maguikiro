<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, isAuthenticated } from '$lib/stores/auth';

	let email = '';
	let password = '';
	let loading = false;
	let errorMessage = '';

	// 如果已登录，重定向到主页 / If already logged in, redirect to home
	$: if ($isAuthenticated) {
		goto('/');
	}

	async function handleSubmit() {
		if (!email || !password) {
			errorMessage = '请输入邮箱和密码 / Please enter email and password';
			return;
		}

		loading = true;
		errorMessage = '';

		const result = await authStore.signIn(email, password);

		if (!result.success) {
			errorMessage = result.error || '登录失败 / Login failed';
			loading = false;
		}
		// 成功时会自动重定向 / Will auto-redirect on success
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSubmit();
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-base-300">
	<div class="card w-96 bg-base-100 shadow-xl">
		<div class="card-body">
			<!-- Logo and Title -->
			<div class="text-center mb-6">
				<h1 class="text-3xl font-bold text-primary mb-2">DOPPLER</h1>
				<h2 class="text-xl font-semibold">磁检测仪器系统</h2>
				<p class="text-sm text-base-content/70">Magnetic Testing Instrument</p>
			</div>

			<!-- Error Message -->
			{#if errorMessage}
				<div class="alert alert-error mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{errorMessage}</span>
				</div>
			{/if}

			<!-- Login Form -->
			<form on:submit|preventDefault={handleSubmit}>
				<div class="form-control">
					<label class="label" for="email">
						<span class="label-text">邮箱 / Email</span>
					</label>
					<input
						id="email"
						type="email"
						placeholder="user@example.com"
						class="input input-bordered"
						bind:value={email}
						on:keypress={handleKeyPress}
						disabled={loading}
						required
					/>
				</div>

				<div class="form-control mt-4">
					<label class="label" for="password">
						<span class="label-text">密码 / Password</span>
					</label>
					<input
						id="password"
						type="password"
						placeholder="••••••••"
						class="input input-bordered"
						bind:value={password}
						on:keypress={handleKeyPress}
						disabled={loading}
						required
					/>
				</div>

				<div class="form-control mt-6">
					<button type="submit" class="btn btn-primary" disabled={loading}>
						{#if loading}
							<span class="loading loading-spinner"></span>
							登录中... / Signing in...
						{:else}
							登录 / Sign In
						{/if}
					</button>
				</div>
			</form>

			<!-- Additional Info -->
			<div class="divider"></div>
			<div class="text-center text-sm text-base-content/70">
				<p>请使用您的系统账户登录</p>
				<p>Please sign in with your system account</p>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
