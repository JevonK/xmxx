package org.cocos2dx.javascript;

import android.app.Application;

public class MyApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        //sdk初始化
        TTAdManagerHolder.init(this);
    }
}
