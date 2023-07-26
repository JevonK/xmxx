package com.union_test.toutiao.activity;

import android.app.Activity;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;

import com.bytedance.sdk.openadsdk.AdSlot;
import com.bytedance.sdk.openadsdk.TTAdManager;
import com.bytedance.sdk.openadsdk.TTAdNative;
import com.bytedance.sdk.openadsdk.TTAppDownloadListener;
import com.bytedance.sdk.openadsdk.TTFeedAd;
import com.bytedance.sdk.openadsdk.core.widget.PlayableView;
import com.union_test.toutiao.R;
import com.union_test.toutiao.config.TTAdManagerHolder;
import com.union_test.toutiao.utils.TToast;

import java.util.List;

public class PlayableOnlyActivity extends Activity {
    public static final String TAG = "PlayableOnlyActivity";
    private Button mBtLoadAd;
    private Button mBtShowInView;
    private Button mBtShowInActivity;
    private FrameLayout mPlayableViewContainer;

    private TTAdNative mTTAdNative;
    private TTFeedAd mTTFeedAd;

    private PlayableView mPlayableView;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_playable_only);
        initView();

        if (savedInstanceState != null) {
            // 界面是通过onSaveInstanceState生命周期来的
            // savedInstanceState不等于null就直接使用上次存留的页面数据
            mPlayableView = new PlayableView(getApplicationContext());
            mPlayableView.initByBundle(savedInstanceState);
            return;
        }

        // step1:初始化sdk
        TTAdManager ttAdManager = TTAdManagerHolder.get();
        // step2:创建TTAdNative对象,用于调用广告请求接口
        mTTAdNative = ttAdManager.createAdNative(getApplicationContext());
        // step3:(可选，强烈建议在合适的时机调用):申请部分权限，如read_phone_state,防止获取不了imei时候，下载类广告没有填充的问题。
        TTAdManagerHolder.get().requestPermissionIfNecessary(this);

    }

    void loadPlayableAd() {
        // step4:创建feed广告请求类型参数AdSlot,具体参数含义参考文档
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId("945385960")
                .setImageAcceptedSize(640, 320)
                .setAdCount(1) //请求广告数量为1到3条
                .build();
        // step5:请求广告，调用feed广告异步请求接口，加载到广告后，拿到广告素材自定义渲染
        mTTAdNative.loadFeedAd(adSlot, new TTAdNative.FeedAdListener() {
            @Override
            public void onError(int code, String message) {
                Log.d(TAG, "Callback --> 试玩广告加载失败 " + code + " " + message);
                TToast.show(PlayableOnlyActivity.this, "广告类型不是试玩类型" + code + " " + message);
            }

            @Override
            public void onFeedAdLoad(List<TTFeedAd> ads) {
                if (ads == null || ads.size() == 0) {
                    return;
                }
                TTFeedAd ad = ads.get(0);
                if (ad.getCustomizePlayable() == null) {
                    Log.d(TAG, "Callback --> 广告类型不是试玩类型");
                    TToast.show(PlayableOnlyActivity.this, "广告类型不是试玩类型");
                    return;
                }
                Log.d(TAG, "Callback --> 试玩广告加载成功");
                TToast.show(PlayableOnlyActivity.this, "试玩广告加载成功");
                mTTFeedAd = ads.get(0);
            }
        });
    }

    void initView() {
        mBtLoadAd = findViewById(R.id.load_ad);
        mBtShowInView = findViewById(R.id.show_in_view);
        mBtShowInActivity = findViewById(R.id.show_in_activity);
        mPlayableViewContainer = findViewById(R.id.playable_view_container);

        mBtLoadAd.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                loadPlayableAd();
            }
        });



        mBtShowInActivity.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mTTFeedAd == null) {
                    TToast.show(PlayableOnlyActivity.this, "请先加载广告");
                    return;
                }
                // step7: 展示方法一，使用Activity方式打开Playable广告
                mTTFeedAd.getCustomizePlayable().showPlayable();

                mTTFeedAd = null;
            }
        });

        mBtShowInView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mTTFeedAd == null) {
                    TToast.show(PlayableOnlyActivity.this, "请先加载广告");
                    return;
                }
                // step7:展示方法二，使用View的方式打开Playable广告
                // 此方法需要注意PlayableView的生命周期
                // 包括开发者自己Activity的onPause、onResume、onStop、onDestroy
                // onSaveInstanceState会在更改系统配置、横竖屏切换、系统语言切换等场景系统返回
                // onSaveInstanceState需要在onCreate中判断Bundle不为空，直接new出PlayableView，并调用playable.initByBundle()
                // 使用示例在上文
                PlayableView playableView = mTTFeedAd.getCustomizePlayable().getAdView();
                playableView.setAppDownloadListener(new TTAppDownloadListener() {
                    @Override
                    public void onIdle() {

                    }

                    @Override
                    public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {
                        Log.d(TAG, "Callback --> 试玩中下载进度" + totalBytes + "/" + currBytes);
                    }

                    @Override
                    public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {

                    }

                    @Override
                    public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {

                    }

                    @Override
                    public void onDownloadFinished(long totalBytes, String fileName, String appName) {

                    }

                    @Override
                    public void onInstalled(String fileName, String appName) {

                    }
                });

                playableView.setCallback(new PlayableView.Callback() {
                    @Override
                    public void onClickClose() {
                        Log.d(TAG, "Callback --> 点击关闭试玩按钮");
                        // 关闭PlayableView时记得调用mPlayableView.onDestroy()
                        finish();
                    }

                    @Override
                    public void onSendReward() {
                        Log.d(TAG, "Callback --> 可以发放试玩奖励");
                    }

                    @Override
                    public void onPlayableContentStatus(String event, String data) {
                        Log.d(TAG, "Callback --> 试玩事件" + event + " " + data);
                    }
                });
                playableView.setCloseButton(false);
                mPlayableViewContainer.removeAllViews();
                mPlayableViewContainer.addView(playableView);
                mPlayableView = playableView;


                mTTFeedAd = null;
            }
        });

    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (mPlayableView != null) {
            mPlayableView.onSaveInstanceState(outState);
        }
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mPlayableView != null) {
            mPlayableView.onPause();
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (mPlayableView != null) {
            mPlayableView.onStop();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mPlayableView != null) {
            mPlayableView.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mPlayableView != null) {
            mPlayableView.onDestroy();
        }
    }
}
