export default class SessionEntity {
    constructor(
        public email: string,
        public password: string,
        public rememberMe: boolean
    ){}
}