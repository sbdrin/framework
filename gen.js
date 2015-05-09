module.exports = {
    citi: {
        model: {
            title: 'String',
            finished: {
                type: 'Boolean',
            default:
                false
            },
            post_date: {
                type: 'Date'
            }
        },
        urls: {
            getUser: {
                rows: [{
                    name: 'citi'
                }]
            }
        }
    },
    vision: {
        urls: {
            getUser: {
                rows: [{
                    name: 'citi'
                }]
            }
        }
    }
};