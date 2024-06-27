(function(h,o,u,n,d) {
	h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
	d=o.createElement(u);d.async=1;d.src=n
	n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
})(window,document,'script','https://www.datadoghq-browser-agent.com/datadog-rum.js','DD_RUM')
DD_RUM.onReady(function() {
	DD_RUM.init({
		clientToken: 'pub1c6db7170e31a023b3e3f1924506cab8',
		applicationId: '6557c674-e853-49cb-b17e-0a0cdb0f9071',
		site: 'datadoghq.com',
		service:'meet-in',
		env:'prod',
		// Specify a version number to identify the deployed version of your application in Datadog 
		// version: '1.0.0',
		sampleRate: 100,
		trackInteractions: true,
	})
})