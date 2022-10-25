module layaTextExt{

    /**缓存池的对象 */
    export var POOLS: { [name: string]: IPool[] } = {};

    /**
     * 缓存池
     * @param cls 类名， 类中必须实现`onReset`方法，在放入缓存池中调用
     * @author cyj
     */
    export function PoolGet<T>(cls: { new(): T & IPool }): T {
        let pooldId = ClassUtil.getClassId(cls);
        let pools: any = POOLS[pooldId];
        if (pools && pools.length > 0) {
            return pools.shift();
        }
        return new cls();
    }

    /**
     * 将对象放到缓存池中
     * @param instance 
     * @returns 
     */
    export function PoolPush<T>(instance: T & IPool) {
        if (!instance) return;
        let pooldId = ClassUtil.getClassId(instance.constructor);
        let pools = POOLS[pooldId];
        if (!pools) pools = POOLS[pooldId] = [];
        if (pools.indexOf(instance) < 0) {
            if (instance.onPool) instance.onPool();
            pools.push(instance);
        }
    }

    export interface IPool{
        onPool?():void;
    }
}