'use strict';

var debug = require('debug')('plugin:mtls-verify');

module.exports.init = function(config, logger, stats) {

	var middleware = function(req, res, next) {
		
        return checkIfCNAuthorized(req, res, next, logger, stats, req.token.client_id);	
        
	}
	
	var checkIfCNAuthorized = function checkIfCNAuthorized(req, res, next, logger, stats, clientId){
		debug('client CN: '+ req.socket.getPeerCertificate().subject.CN);
		debug('client_id: ' + clientId);
		if(req.socket.getPeerCertificate().subject.CN !== clientId){
			return sendError(req, res, next, logger, stats, 'access_denied');
		}
		return next();
	}

	return {

        onrequest: function(req, res, next) {
            if (process.env.EDGEMICRO_LOCAL == "1") {
                debug ("MG running in local mode. Skipping MTLS Verify");
                next();
            } else {
                middleware(req, res, next);
            }
        }
    };
}

function sendError(req, res, next, logger, stats, code, message) {

    switch (code) {
        case 'invalid_request':
            res.statusCode = 400;
            break;
        case 'access_denied':
            res.statusCode = 403;
            break;
        case 'invalid_token':
        case 'missing_authorization':
        case 'invalid_authorization':
            res.statusCode = 401;
            break;
        case 'gateway_timeout':
            res.statusCode = 504;
            break;
        default:
            res.statusCode = 500;
    }

    var response = {
        error: code,
        error_description: message
    };

    debug('auth failure', res.statusCode, code, message ? message : '', req.headers, req.method, req.url);
    logger.error({
        req: req,
        res: res
    }, 'mtls-verify');

    //opentracing
    if (process.env.EDGEMICRO_OPENTRACE) {
        try {
            const traceHelper = require('../microgateway-core/lib/trace-helper');
            traceHelper.setChildErrorSpan('mtls-verify', req.headers);        
        } catch (err) {}
    }
    //

    if (!res.finished) res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(response));
    stats.incrementStatusCount(res.statusCode);
    next(code, message);
    return code;
}
