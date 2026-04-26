const createLocalStorage = () => {
    return {
        getItem(key: string) {
            return Promise.resolve(window.localStorage.getItem(key))
        },
        setItem(key: string, value: string) {
            return Promise.resolve(window.localStorage.setItem(key, value))
        },
        removeItem(key: string) {
            return Promise.resolve(window.localStorage.removeItem(key))
        },
    }
}

const createNoopStorage = () => {
    return {
        getItem(_key: string) {
            return Promise.resolve(null)
        },
        setItem(_key: string, value: unknown) {
            return Promise.resolve(value)
        },
        removeItem(_key: string) {
            return Promise.resolve()
        },
    }
}

const storage =
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
        ? createLocalStorage()
        : createNoopStorage()

export default storage