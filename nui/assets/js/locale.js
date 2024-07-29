Language = {}

function _L(key, ...args) {
    if (Language && Language[key]) {
        return Language[key].replace(/%s/g, function() {
            return args.shift()
        })
    }
    return key
}
