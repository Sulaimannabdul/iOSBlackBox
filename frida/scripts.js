try {
	Module.ensureInitialized("libboringssl.dylib");
} catch(err) {
	console.log("libboringssl.dylib module not loaded. Trying to manually load it.")
	Module.load("libboringssl.dylib");	
}

var SSL_VERIFY_NONE = 0;
var ssl_set_custom_verify;
var ssl_get_psk_identity;	

ssl_set_custom_verify = new NativeFunction(
	Module.findExportByName("libboringssl.dylib", "SSL_set_custom_verify"),
	'void', ['pointer', 'int', 'pointer']
);

/* Create SSL_get_psk_identity NativeFunction 
* Function signature https://commondatastorage.googleapis.com/chromium-boringssl-docs/ssl.h.html#SSL_get_psk_identity
*/
ssl_get_psk_identity = new NativeFunction(
	Module.findExportByName("libboringssl.dylib", "SSL_get_psk_identity"),
	'pointer', ['pointer']
);

/** Custom callback passed to SSL_CTX_set_custom_verify */
function custom_verify_callback_that_does_not_validate(ssl, out_alert){
	return SSL_VERIFY_NONE;
}

/** Wrap callback in NativeCallback for frida */
var ssl_verify_result_t = new NativeCallback(function (ssl, out_alert){
	custom_verify_callback_that_does_not_validate(ssl, out_alert);
},'int',['pointer','pointer']);

Interceptor.replace(ssl_set_custom_verify, new NativeCallback(function(ssl, mode, callback) {
	//  |callback| performs the certificate verification. Replace this with our custom callback
	ssl_set_custom_verify(ssl, mode, ssl_verify_result_t);
}, 'void', ['pointer', 'int', 'pointer']));

Interceptor.replace(ssl_get_psk_identity, new NativeCallback(function(ssl) {
	return "notarealPSKidentity";
}, 'pointer', ['pointer']));
	
console.log("[+] Bypass successfully loaded ");	

// Variables
var SSL_VERIFY_NONE = 0;
var ssl_ctx_set_custom_verify;
var ssl_get_psk_identity;

/* Create SSL_CTX_set_custom_verify NativeFunction 
 *  Function signature https://github.com/google/boringssl/blob/7540cc2ec0a5c29306ed852483f833c61eddf133/include/openssl/ssl.h#L2294
 */
ssl_ctx_set_custom_verify = new NativeFunction(
    Module.findExportByName("libboringssl.dylib", "SSL_CTX_set_custom_verify"),
    'void', ['pointer', 'int', 'pointer']
);

/* Create SSL_get_psk_identity NativeFunction 
 * Function signature https://commondatastorage.googleapis.com/chromium-boringssl-docs/ssl.h.html#SSL_get_psk_identity
 */
ssl_get_psk_identity = new NativeFunction(
    Module.findExportByName("libboringssl.dylib", "SSL_get_psk_identity"),
    'pointer', ['pointer']
);

/** Custom callback passed to SSL_CTX_set_custom_verify */
function custom_verify_callback_that_does_not_validate(ssl, out_alert) {
    return SSL_VERIFY_NONE;
}

/** Wrap callback in NativeCallback for frida */
var ssl_verify_result_t = new NativeCallback(function(ssl, out_alert) {
    custom_verify_callback_that_does_not_validate(ssl, out_alert);
}, 'int', ['pointer', 'pointer']);

/* Do the actual bypass */
function bypassSSL() {
    console.log("[+] Bypass successfully loaded ");

    Interceptor.replace(ssl_ctx_set_custom_verify, new NativeCallback(function(ssl, mode, callback) {
        //  |callback| performs the certificate verification. Replace this with our custom callback
        ssl_ctx_set_custom_verify(ssl, mode, ssl_verify_result_t);
    }, 'void', ['pointer', 'int', 'pointer']));

    Interceptor.replace(ssl_get_psk_identity, new NativeCallback(function(ssl) {
        return "notarealPSKidentity";
    }, 'pointer', ['pointer']));

}

bypassSSL();
