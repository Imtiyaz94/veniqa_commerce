<? xml version = "1.0" encoding = "UTF-8" ?>
	<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
		<CORSRule>
			<AllowedOrigin>https://*</AllowedOrigin>
			<AllowedMethod>GET</AllowedMethod>
			<AllowedHeader>*</AllowedHeader>
		</CORSRule>
		<CORSRule>
			<AllowedOrigin>https://admin.veniqa.com</AllowedOrigin>
			<AllowedOrigin>https://www.admin.veniqa.com</AllowedOrigin>
			<AllowedMethod>GET</AllowedMethod>
			<AllowedMethod>HEAD</AllowedMethod>
			<AllowedMethod>PUT</AllowedMethod>
			<AllowedMethod>POST</AllowedMethod>
			<AllowedMethod>DELETE</AllowedMethod>
			<AllowedHeader>*</AllowedHeader>
		</CORSRule>
		{/* For local machine add followings rules also in s3 bucket */}
		<CORSRule>
			<AllowedOrigin>http://localhost:5202</AllowedOrigin>
			<AllowedMethod>GET</AllowedMethod>
			<AllowedMethod>HEAD</AllowedMethod>
			<AllowedMethod>PUT</AllowedMethod>
			<AllowedMethod>POST</AllowedMethod>
			<AllowedMethod>DELETE</AllowedMethod>
			<AllowedHeader>*</AllowedHeader>
		</CORSRule>
	</CORSConfiguration>;
