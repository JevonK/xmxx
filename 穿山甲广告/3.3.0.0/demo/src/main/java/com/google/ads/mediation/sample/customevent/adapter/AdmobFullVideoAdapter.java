package com.google.ads.mediation.sample.customevent.adapter;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import com.bytedance.sdk.openadsdk.AdSlot;
import com.bytedance.sdk.openadsdk.TTAdConstant;
import com.bytedance.sdk.openadsdk.TTAdManager;
import com.bytedance.sdk.openadsdk.TTAdNative;
import com.bytedance.sdk.openadsdk.TTFullScreenVideoAd;
import com.google.android.gms.ads.mediation.MediationAdRequest;
import com.google.android.gms.ads.mediation.customevent.CustomEventInterstitial;
import com.google.android.gms.ads.mediation.customevent.CustomEventInterstitialListener;
import com.union_test.toutiao.config.TTAdManagerHolder;

import java.util.concurrent.atomic.AtomicBoolean;

/**
 * created by wuzejian on 2019-12-03
 * 全屏视频
 */
public class AdmobFullVideoAdapter implements CustomEventInterstitial {
    private static final String ADAPTER_NAME = "AdmobFullVideoAdapter";

    private TTFullScreenVideoAd mttFullVideoAd;

    private CustomEventInterstitialListener admobAdListener;
    private Context context;
    //    private String placementId = "901121073";
    private String mCodeId = "901121073";
    private AtomicBoolean isLoadSuccess = new AtomicBoolean(false);


    @Override
    public void requestInterstitialAd(Context context,
                                      CustomEventInterstitialListener listener,
                                      String serverParameter,
                                      MediationAdRequest mediationAdRequest,
                                      Bundle customEventExtras) {
        Log.e(ADAPTER_NAME, " TTFullScreenVideoAd->requestInterstitialAd");

        this.context = context;
        this.admobAdListener = listener;
//        this.placementId = serverParameter; 服务端下发

        Log.e("PlacementId", serverParameter);
        TTAdManagerHolder.init(context);
        TTAdManager ttAdManager = TTAdManagerHolder.get();
        TTAdNative mTTAdNative = ttAdManager.createAdNative(this.context);

        if (customEventExtras != null) {
            mCodeId = customEventExtras.getString("codeId");
            Log.e(ADAPTER_NAME, " TTFullScreenVideoAd->mCodeId =" + mCodeId);
        }
        AdSlot adSlot = new AdSlot.Builder()
                .setCodeId(mCodeId)
                .setImageAcceptedSize(1080, 1920)
                .build();

        mTTAdNative.loadFullScreenVideoAd(adSlot, mTTFullScreenAdListener);

    }

    @Override
    public void showInterstitial() {
        if (mttFullVideoAd != null && isLoadSuccess.get()) {
            this.mttFullVideoAd.showFullScreenVideoAd((Activity) this.context);
        }
    }

    private TTAdNative.FullScreenVideoAdListener mTTFullScreenAdListener = new TTAdNative.FullScreenVideoAdListener() {

        @Override
        public void onError(int i, String s) {
            isLoadSuccess.set(false);
            if (admobAdListener != null) {
                admobAdListener.onAdFailedToLoad(i);
            }
            Toast.makeText(context, "TikTok Ad Failed to load, error code is:" + i, Toast.LENGTH_SHORT).show();
            AdmobFullVideoAdapter.this.admobAdListener.onAdFailedToLoad(i);
        }

        @Override
        public void onFullScreenVideoAdLoad(TTFullScreenVideoAd ttFullScreenVideoAd) {
            isLoadSuccess.set(true);
            if (admobAdListener != null) {
                admobAdListener.onAdLoaded();
            }
            AdmobFullVideoAdapter.this.mttFullVideoAd = ttFullScreenVideoAd;
            AdmobFullVideoAdapter.this.mttFullVideoAd.setFullScreenVideoAdInteractionListener(new TTFullScreenVideoAd.FullScreenVideoAdInteractionListener() {
                @Override
                public void onAdShow() {
                    if (admobAdListener != null) {
                        admobAdListener.onAdOpened();
                    }
                }

                @Override
                public void onAdVideoBarClick() {
                    if (admobAdListener != null) {
                        admobAdListener.onAdClicked();
                    }
                }

                @Override
                public void onAdClose() {
                    if (admobAdListener != null) {
                        admobAdListener.onAdClosed();
                    }
                }

                @Override
                public void onVideoComplete() {

                }

                @Override
                public void onSkippedVideo() {
                }
            });
        }

        @Override
        public void onFullScreenVideoCached() {

        }
    };

    @Override
    public void onDestroy() {
        if (mttFullVideoAd != null) {
            mttFullVideoAd = null;
        }
    }

    @Override
    public void onPause() {

    }

    @Override
    public void onResume() {

    }
}
