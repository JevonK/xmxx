package com.union_test.toutiao.activity;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;

import com.bytedance.sdk.openadsdk.TTAdConstant;
import com.bytedance.sdk.openadsdk.TTAppDownloadListener;
import com.bytedance.sdk.openadsdk.TTPlayableAd;
import com.bytedance.sdk.openadsdk.TTPlayableTools;
import com.union_test.toutiao.R;
import com.union_test.toutiao.utils.TToast;

public class PlayableViewActivity extends Activity {
    public static final String TAG = "PlayableViewActivity";

    private FrameLayout mPlayableViewContainer;
    private Button mBtLoadAd;
    private Button mBtShowInView;
    private Button mBtShowInActivity;

    private TTPlayableAd mPlayableAd;
    private TTPlayableAd.Builder mPlayableViewBuilder;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_playable_view);
        initView();

        if (savedInstanceState != null) {
            // 界面是通过onSaveInstanceState生命周期来的
            // savedInstanceState不等于null就直接使用上次存留的页面数据
            mPlayableAd = TTPlayableTools.createPlayableAd(getApplicationContext());
            mPlayableAd.initByBundle(savedInstanceState);
            return;
        }

        // 开发调试工具，无需理会
        setParamsFromTestTool();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        // 开发调试工具，无需理会
        setParamsFromTestTool();
    }

    private void initView() {
        mPlayableViewContainer = findViewById(R.id.playable_view_container);

        mBtLoadAd = findViewById(R.id.load_ad);
        mBtShowInView = findViewById(R.id.show_in_view);
        mBtShowInActivity = findViewById(R.id.show_in_activity);

        mBtLoadAd.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mPlayableViewBuilder = TTPlayableTools.createPlayableBuilder()
                        .playableUrl("https://sf3-ttcdn-tos.pstatp.com/obj/union-fe/playable/82e8b08b92f4ce1bf4a4b08c3c3f4e90/index.html?toutiao_card_params=%7B%22name%22%3A%20%22%5Cu76ae%5Cu76ae%5Cu867e%5Cu4f20%5Cu5947-APP%22%2C%20%22pkg_name%22%3A%20%22com.miaoju.ppxcq.jrtt%22%2C%20%22id%22%3A%201635398789479437%2C%20%22download_url%22%3A%20%22https%3A//sf3-ttcdn-tos.pstatp.com/obj/game-files/com.miaoju.ppxcq.jrtt.apk%22%2C%20%22external_url%22%3A%20%22%22%7D&ad_id=1635397103471628&_toutiao_params=%7B%22cid%22%3A1635398789479437%2C%22device_id%22%3A69811064920%2C%22log_extra%22%3A%22%7B%5C%22ad_price%5C%22%3Anull%2C%5C%22convert_id%5C%22%3A1635303998582787%2C%5C%22orit%5C%22%3A900000000%2C%5C%22req_id%5C%22%3A%5C%22d4c80c37-4598-4df6-b929-8d8d83be4ad7u2503%5C%22%2C%5C%22rit%5C%22%3A901121365%7D%22%2C%22orit%22%3A900000000%2C%22req_id%22%3A%22d4c80c37-4598-4df6-b929-8d8d83be4ad7u2503%22%2C%22rit%22%3A901121365%2C%22sign%22%3A%22D41D8CD98F00B204E9800998ECF8427E%22%2C%22uid%22%3A4146993503409611%2C%22ut%22%3A12%7D")
                        .downloadAppInfo("爱上消消消", 49431809, 5103, "https://ad.toutiao.com/advertiser_package/dl/ac2bd73a_1658933415033864_1585561633069", "love.match.set", 5)
                        .interactionType(TTAdConstant.INTERACTION_TYPE_DOWNLOAD)
                        .showLoading("http://p3-tt.byteimg.com/img/web.business.image/202003315d0d4717032cae1d4142b228~100x100.image", 100, 100)
                        .waitJsRemoveLoading(true)
                        .build();
                TToast.show(PlayableViewActivity.this, "初始化成功");

            }
        });

        mBtShowInView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mPlayableViewBuilder == null) {
                    TToast.show(PlayableViewActivity.this, "请先加载广告");
                    return;
                }

                mPlayableAd = mPlayableViewBuilder.getAdView();
                mPlayableAd.setAppDownloadListener(new TTAppDownloadListener() {
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

                mPlayableAd.setCallback(new TTPlayableAd.Callback() {
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

                // PlayableView上的关闭按钮可以不展示，如果是true，会通过上文的onClickClose拿到点击回调
//                mPlayableAd.setCloseButton(false);
                mPlayableViewContainer.removeAllViews();
                mPlayableViewContainer.addView(mPlayableAd.getAdView());
                mPlayableViewBuilder = null;
            }
        });

        mBtShowInActivity.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mPlayableViewBuilder == null) {
                    TToast.show(PlayableViewActivity.this, "请先加载广告");
                    return;
                }
                mPlayableViewBuilder.showPlayableActivity();
                mPlayableViewBuilder = null;
            }
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (mPlayableAd != null) {
            mPlayableAd.onSaveInstanceState(outState);
        }
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mPlayableAd != null) {
            mPlayableAd.onPause();
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (mPlayableAd != null) {
            mPlayableAd.onStop();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mPlayableAd != null) {
            mPlayableAd.onResume();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (mPlayableAd != null) {
            mPlayableAd.onDestroy();
        }
    }

    private void setParamsFromTestTool() {
        try {
            Intent intent = getIntent();
            if (intent == null) {
                return;
            }
            Uri deepLink = intent.getData();
            if (deepLink == null) {
                return;
            }
            String data = deepLink.getQueryParameter("data");
            mPlayableViewBuilder =  TTPlayableTools.parseBuilder(data);
            if (mPlayableViewBuilder != null) {
                TToast.show(PlayableViewActivity.this, "通过测试工具初始化成功");
            }
        } catch (Throwable t) {
            Log.e(TAG, "setParamsFromTestTool error", t);
        }
    }

}
