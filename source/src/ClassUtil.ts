module layaTextExt {
    /**
     * 类的工具类
     * @author cyj
     */
    export class ClassUtil {

        private static _CLASS_ID_SIGN = "__classid";
        private static _CLASS_ID = 0;
        private static _CLASS_DIC: {
            [id: string]: any
        } = {};

        /**
         * 获取类的classId如果为空则创建一个
         * @param cls 
         * @returns 
         */
        static getClassId(cls: any): string {
            let s = this;
            let hasSigned = cls.hasOwnProperty(s._CLASS_ID_SIGN);
            if (!hasSigned) {
                s._CLASS_DIC[s._CLASS_ID] = cls;
                Object.defineProperty(cls, s._CLASS_ID_SIGN, {
                    value: 'CLS_' + (s._CLASS_ID++),
                    enumerable: false,
                    writable: false,
                });
            }
            return cls[s._CLASS_ID_SIGN];
        }

        /**
         * 根据实例获取 对应类的classId
         * @param instance 
         * @returns 
         */
        static getClassIdByInstance(instance: {
            constructor: any
        }) {
            return this.getClassId(instance.constructor)
        }

        /**
         * 注册类的classId
         * @param cls 
         * @param classId 
         */
        static regClassId(cls: any, classId: string) {
            let s = this;
            s._CLASS_DIC[classId] = cls;
            Object.defineProperty(cls, s._CLASS_ID_SIGN, {
                value: classId,
                enumerable: false,
                writable: false,
            });
        }

        /**
         * 根据id返回对应的类
         * @param id 
         * @returns 
         */
        static getClassById(id: string) {
            return this._CLASS_DIC[id];
        }
    }
}