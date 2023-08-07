// import Vue from 'vue';
// 
// // eslint-disable-next-line import/prefer-default-export
// export const eventHub = new Vue();

// latest version
import { createApp, ref } from 'vue';

// Create a reactive eventHub using ref()
export const eventHub = createApp({
	eventHub: ref(new Vue()) // Vue instance is no longer needed, just for compatibility
});
