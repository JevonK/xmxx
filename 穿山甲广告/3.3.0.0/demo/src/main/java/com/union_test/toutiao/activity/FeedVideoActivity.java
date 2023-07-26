package com.union_test.toutiao.activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.VideoView;

import com.bumptech.glide.Glide;
import com.bytedance.sdk.openadsdk.AdSlot;
import com.bytedance.sdk.openadsdk.DownloadStatusController;
import com.bytedance.sdk.openadsdk.TTAdConstant;
import com.bytedance.sdk.openadsdk.TTAdDislike;
import com.bytedance.sdk.openadsdk.TTAdManager;
import com.bytedance.sdk.openadsdk.TTAdNative;
import com.bytedance.sdk.openadsdk.TTAppDownloadListener;
import com.bytedance.sdk.openadsdk.TTFeedAd;
import com.bytedance.sdk.openadsdk.TTImage;
import com.bytedance.sdk.openadsdk.TTNativeAd;
import com.union_test.toutiao.R;
import com.union_test.toutiao.config.TTAdManagerHolder;
import com.union_test.toutiao.utils.TToast;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * 此类型广告暂未测试完成，请勿使用！！
 *
 */

public class FeedVideoActivity extends Activity {
    public static final String TAG = "FeedVideoActivity";
    private TTAdNative mTTAdNative;


    private Button mLoadAdButton;
    private Button mStartPlayButton;
    private Button mPauseVideoButton;
    private Button mResumeVideoButton;

    private ViewGroup mRlVideoAdLayout;
    private VideoView mVideoView;
    private ImageView mIcon;
    private ImageView mDislike;
    private Button mCreativeButton;
    private TextView mTitle;
    private TextView mDescription;
    private TextView mSource;
    private Button mStopButton;
    private Button mRemoveButton;

    private TTFeedAd mTTFeedAd;

    private TTFeedAd mPlayingTTFeedAd;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_feed_video);
        initViews();

        // step1:初始化sdk
        TTAdManager ttAdManager = TTAdManagerHolder.get();
        // step2:创建TTAdNative对象,用于调用广告请求接口
        mTTAdNative = ttAdManager.createAdNative(getApplicationContext());
        // step3:(可选，强烈建议在合适的时机调用):申请部分权限，如read_phone_state,防止获取不了imei时候，下载类广告没有填充的问题。
        TTAdManagerHolder.get().requestPermissionIfNecessary(this);

    }

    private void loadFeedVideoAd() {
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
                TToast.show(FeedVideoActivity.this, message);
            }

            @Override
            public void onFeedAdLoad(List<TTFeedAd> ads) {

                if (ads == null || ads.isEmpty()) {
                    TToast.show(getApplicationContext(), "广告加载失败");
                    return;
                }

                for (TTFeedAd ad : ads) {
                    if (ad.getCustomVideo() != null) {
                        // step6:关键点在这里，ad.getCustomVideo().getVideoUrl()就是视频url
                        // ad.getCustomVideo()下面的reportXXX()方法是埋点上报，请根据自己播放器播放的情况自行上报
                        // 其他的使用方法和常规的Feed广告一样，关键点在于step6
                        String videoUrl = ad.getCustomVideo().getVideoUrl();
                        if (videoUrl != null) {
                            mTTFeedAd = ad;
                            TToast.show(getApplicationContext(), "广告加载完成");
                        } else {
                            TToast.show(getApplicationContext(), "广告类型不是视频类型，请确认次广告位是纯视频类型");
                        }
                    }
                    ad.setActivityForDownloadApp(FeedVideoActivity.this);
                }
            }
        });
    }

    private void initViews() {
        mRlVideoAdLayout = findViewById(R.id.rl_video_ad_layout);
        mVideoView = findViewById(R.id.iv_listitem_video);
        mTitle = findViewById(R.id.tv_listitem_ad_title);
        mDescription = findViewById(R.id.tv_listitem_ad_desc);
        mSource = findViewById(R.id.tv_listitem_ad_source);
        mIcon = findViewById(R.id.iv_listitem_icon);
        mDislike = findViewById(R.id.iv_listitem_dislike);
        mCreativeButton = findViewById(R.id.btn_listitem_creative);
        mStopButton = findViewById(R.id.btn_listitem_stop);
        mRemoveButton = findViewById(R.id.btn_listitem_remove);
        mVideoView = findViewById(R.id.iv_listitem_video);

        // 加载广告
        mLoadAdButton = findViewById(R.id.bt_load_ad);
        mLoadAdButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                loadFeedVideoAd();
            }
        });

        // 开始播放视频
        mStartPlayButton = findViewById(R.id.bt_start_play);
        mStartPlayButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mTTFeedAd != null) {

                    // 将正在播放的视频上报退出
                    if (mPlayingTTFeedAd != null && mPlayingTTFeedAd.getCustomVideo() != null) {
                        mPlayingTTFeedAd.getCustomVideo().reportVideoBreak(mVideoView.getCurrentPosition());
                    }

                    setAdView(mTTFeedAd);
                    mTTFeedAd = null;
                } else {
                    TToast.show(getApplicationContext(), "请先加载广告");
                }
            }
        });

        // 暂停视频
        mPauseVideoButton = findViewById(R.id.bt_pause_play);
        mPauseVideoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mVideoView != null && mVideoView.canPause()) {
                    mVideoView.pause();
                    if (mPlayingTTFeedAd != null && mPlayingTTFeedAd.getCustomVideo() != null) {
                        mPlayingTTFeedAd.getCustomVideo().reportVideoPause(mVideoView.getCurrentPosition());
                    }
                }
            }
        });

        // 继续播放
        mResumeVideoButton = findViewById(R.id.bt_resume_play);
        mResumeVideoButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mVideoView != null && !mVideoView.isPlaying()) {
                    mVideoView.start();

                    if (mPlayingTTFeedAd != null && mPlayingTTFeedAd.getCustomVideo() != null) {
                        mPlayingTTFeedAd.getCustomVideo().reportVideoContinue(mVideoView.getCurrentPosition());
                    }

                }
            }
        });

    }

    private void setAdView(@NonNull final TTFeedAd ad) {
        try {
            //视频广告设置播放状态回调（可选）
            ad.setVideoAdListener(new TTFeedAd.VideoAdListener() {
                @Override
                public void onVideoLoad(TTFeedAd ad) {

                }

                @Override
                public void onVideoError(int errorCode, int extraCode) {

                }

                @Override
                public void onVideoAdStartPlay(TTFeedAd ad) {

                }

                @Override
                public void onVideoAdPaused(TTFeedAd ad) {

                }

                @Override
                public void onVideoAdContinuePlay(TTFeedAd ad) {

                }

                @Override
                public void onProgressUpdate(long current, long duration) {
                    Log.e("VideoAdListener", "===onProgressUpdate current:" + current + " duration:" + duration);
                }

                @Override
                public void onVideoAdComplete(TTFeedAd ad) {
                    Log.e("VideoAdListener", "===onVideoAdComplete");
                }
            });
            Log.e("VideoAdListener", "video ad duration:" + ad.getVideoDuration());
            //绑定广告数据、设置交互回调
            bindData(ad);
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    private void bindData(final TTFeedAd ad) {
        bindDislikeCustom(mDislike, ad);
        List<View> clickViewList = new ArrayList<>();
        clickViewList.add(mVideoView);
        List<View> creativeViewList = new ArrayList<>();
        creativeViewList.add(mCreativeButton);
        //重要! 这个涉及到广告计费，必须正确调用。convertView必须使用ViewGroup。
        ad.registerViewForInteraction((ViewGroup) mRlVideoAdLayout, clickViewList, creativeViewList, mDislike, new TTNativeAd.AdInteractionListener() {
            @Override
            public void onAdClicked(View view, TTNativeAd ad) {
                if (ad != null) {
                    TToast.show(getApplicationContext(), "广告" + ad.getTitle() + "被点击");
                }
            }

            @Override
            public void onAdCreativeClick(View view, TTNativeAd ad) {
                if (ad != null) {
                    TToast.show(getApplicationContext(), "广告" + ad.getTitle() + "被创意按钮被点击");
                }
            }

            @Override
            public void onAdShow(TTNativeAd ad) {
                if (ad != null) {
                    TToast.show(getApplicationContext(), "广告" + ad.getTitle() + "展示");
                }
            }
        });


        Uri uri = Uri.parse(ad.getCustomVideo().getVideoUrl());
        mVideoView.setVideoURI(uri);
        mVideoView.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
            @Override
            public void onCompletion(MediaPlayer mp) {
                mPlayingTTFeedAd = null;
                ad.getCustomVideo().reportVideoFinish();
            }
        });
        mVideoView.start();
        ad.getCustomVideo().reportVideoStart();
        mPlayingTTFeedAd = ad;


        mTitle.setText(ad.getTitle()); //title为广告的简单信息提示
        mDescription.setText(ad.getDescription()); //description为广告的较长的说明
        mSource.setText(ad.getSource() == null ? "广告来源" : ad.getSource());
        TTImage icon = ad.getIcon();
        if (icon != null && icon.isValid()) {
            Glide.with(getApplicationContext()).load(icon.getImageUrl()).into(mIcon);
        }
        switch (ad.getInteractionType()) {
            case TTAdConstant.INTERACTION_TYPE_DOWNLOAD:
                //如果初始化ttAdManager.createAdNative(getApplicationContext())没有传入activity 则需要在此传activity，否则影响使用Dislike逻辑
                if (getApplicationContext() instanceof Activity) {
                    ad.setActivityForDownloadApp((Activity) getApplicationContext());
                }
                mCreativeButton.setVisibility(View.VISIBLE);
                if (mStopButton != null) {
                    mStopButton.setVisibility(View.VISIBLE);
                }
                mRemoveButton.setVisibility(View.VISIBLE);
                bindDownloadListener(ad);
                //绑定下载状态控制器
                bindDownLoadStatusController(ad);
                break;
            case TTAdConstant.INTERACTION_TYPE_DIAL:
                mCreativeButton.setVisibility(View.VISIBLE);
                mCreativeButton.setText("立即拨打");
                if (mStopButton != null) {
                    mStopButton.setVisibility(View.GONE);
                }
                mRemoveButton.setVisibility(View.GONE);
                break;
            case TTAdConstant.INTERACTION_TYPE_LANDING_PAGE:
            case TTAdConstant.INTERACTION_TYPE_BROWSER:
//                    mCreativeButton.setVisibility(View.GONE);
                mCreativeButton.setVisibility(View.VISIBLE);
                mCreativeButton.setText("查看详情");
                if (mStopButton != null) {
                    mStopButton.setVisibility(View.GONE);
                }
                mRemoveButton.setVisibility(View.GONE);
                break;
            default:
                mCreativeButton.setVisibility(View.GONE);
                if (mStopButton != null) {
                    mStopButton.setVisibility(View.GONE);
                }
                mRemoveButton.setVisibility(View.GONE);
                TToast.show(getApplicationContext(), "交互类型异常");
        }
    }

    private void bindDownLoadStatusController(final TTFeedAd ad) {
        final DownloadStatusController controller = ad.getDownloadStatusController();
        if (mStopButton != null) {
            mStopButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (controller != null) {
                        controller.changeDownloadStatus();
                        TToast.show(getApplicationContext(), "改变下载状态");
                        Log.d(TAG, "改变下载状态");
                    }
                }
            });
        }

        mRemoveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (controller != null) {
                    controller.cancelDownload();
                    TToast.show(getApplicationContext(), "取消下载");
                    Log.d(TAG, "取消下载");
                }
            }
        });
    }

    private void bindDislikeCustom(View dislike, final TTFeedAd ad) {
        final TTAdDislike ttAdDislike = ad.getDislikeDialog(this);
        if (ttAdDislike != null) {
            ad.getDislikeDialog(this).setDislikeInteractionCallback(new TTAdDislike.DislikeInteractionCallback() {
                @Override
                public void onSelected(int position, String value) {

                }

                @Override
                public void onCancel() {

                }

                @Override
                public void onRefuse() {

                }
            });
        }
        dislike.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (ttAdDislike != null)
                    ttAdDislike.showDislikeDialog();
            }
        });

    }

    private void bindDownloadListener(TTFeedAd ad) {
        TTAppDownloadListener downloadListener = new TTAppDownloadListener() {
            @Override
            public void onIdle() {

                mCreativeButton.setText("开始下载");
                if (mStopButton != null) {
                    mStopButton.setText("开始下载");
                }
            }

            @SuppressLint("SetTextI18n")
            @Override
            public void onDownloadActive(long totalBytes, long currBytes, String fileName, String appName) {

                if (totalBytes <= 0L) {
                    mCreativeButton.setText("0%");
                } else {
                    mCreativeButton.setText((currBytes * 100 / totalBytes) + "%");
                }
                if (mStopButton != null) {
                    mStopButton.setText("下载中");
                }
            }

            @SuppressLint("SetTextI18n")
            @Override
            public void onDownloadPaused(long totalBytes, long currBytes, String fileName, String appName) {

                if (totalBytes <= 0L) {
                    mCreativeButton.setText("0%");
                } else {
                    mCreativeButton.setText((currBytes * 100 / totalBytes) + "%");
                }
                if (mStopButton != null) {
                    mStopButton.setText("下载暂停");
                }
            }

            @Override
            public void onDownloadFailed(long totalBytes, long currBytes, String fileName, String appName) {

                mCreativeButton.setText("重新下载");
                if (mStopButton != null) {
                    mStopButton.setText("重新下载");
                }
            }

            @Override
            public void onInstalled(String fileName, String appName) {

                mCreativeButton.setText("点击打开");
                if (mStopButton != null) {
                    mStopButton.setText("点击打开");
                }
            }

            @Override
            public void onDownloadFinished(long totalBytes, String fileName, String appName) {

                mCreativeButton.setText("点击安装");
                if (mStopButton != null) {
                    mStopButton.setText("点击安装");
                }
            }

        };
        //一个ViewHolder对应一个downloadListener, isValid判断当前ViewHolder绑定的listener是不是自己
        ad.setDownloadListener(downloadListener); // 注册下载监听器
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // 将正在播放的视频上报退出
        if (mPlayingTTFeedAd != null && mPlayingTTFeedAd.getCustomVideo() != null) {
            mPlayingTTFeedAd.getCustomVideo().reportVideoBreak(mVideoView.getCurrentPosition());
        }
    }
}
