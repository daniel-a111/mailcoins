const msal = require('@azure/msal-node');

/**  
 * Configuration object to be passed to MSAL instance on creation.   
 * For a full list of MSAL Node configuration parameters, visit:  
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md   
 */
const msalConfig = {
    auth: {
        clientId: "*******************-589b9fbd51d3",
        authority: "https://login.microsoftonline.com/*********************-d2c178decee1",
        clientSecret: "***********************iqDQNl48FGc63"
    }
};

const tokenRequest = {
    scopes: ["https://graph.microsoft.com/.default"]
    // scopes: ["https://outlook.office.com/IMAP.AccessAsUser.All"],  

};

/**  
 * Initialize a confidential client application. For more info, visit:  
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/initialize-confidential-client-application.md  
 */



/**  
 * Acquires token with client credentials.  
 * @param {object} tokenRequest   
 */
async function getToken(tokenRequest) {
    const cca = new msal.ConfidentialClientApplication(msalConfig);
    const msalTokenCache = cca.getTokenCache();
    return await cca.acquireTokenByClientCredential(tokenRequest);
}

async function main() {

    try {
        const authResponse = await getToken(tokenRequest);
        console.log(authResponse.accessToken);
    } catch (error) {
        console.log(error);
    }
};

main();  