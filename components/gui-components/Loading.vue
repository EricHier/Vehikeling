<template>
  <div class="lds-dual-ring m-4 mx-auto"></div>
</template>
<style scoped lang="scss">
  $accent: #00d1b2;

  .lds-dual-ring {
    display: block;
    width: 3rem;
    height: 3rem;
  }

  .lds-dual-ring:after {
    content: " ";
    display: block;
    width: 2.5rem;
    height: 2.5rem;
    margin: 0.25rem;
    border-radius: 50%;
    border: 3px solid $accent;
    border-color: $accent transparent $accent transparent;
    animation: lds-dual-ring 1.2s linear infinite;
  }

  @keyframes lds-dual-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

</style>
