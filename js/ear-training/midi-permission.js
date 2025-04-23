// MIDI权限Cookie管理
(function() {
    // 设置cookie函数
    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    // 获取cookie函数
    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // 检查是否已经授权MIDI权限
    var midiPermissionGranted = getCookie("midiPermissionGranted");

    // 重写MIDI.loadPlugin方法以添加Cookie支持
    if (typeof MIDI !== 'undefined' && MIDI.loadPlugin) {
        var originalLoadPlugin = MIDI.loadPlugin;
        
        MIDI.loadPlugin = function(options) {
            var originalOnSuccess = options.onsuccess;
            
            options.onsuccess = function() {
                // 设置权限Cookie，有效期30天
                setCookie("midiPermissionGranted", "true", 30);
                
                if (originalOnSuccess) {
                    originalOnSuccess();
                }
            };
            
            // 如果已经有权限，不再显示权限请求对话框
            if (midiPermissionGranted === "true") {
                options.targetFormat = 'mp3';
                console.log("MIDI permission already granted, using stored permission");
            }
            
            originalLoadPlugin.call(MIDI, options);
        };
    }
    
    // 确保Start Quiz按钮正常工作
    $(document).ready(function() {
        $("#start-quiz").click(function(e) {
            // 检查是否已经点击过
            if ($(this).hasClass('clicked')) {
                return;
            }
            
            // 标记按钮已被点击
            $(this).addClass('clicked');
            
            // 尝试初始化MIDI权限（如果还没有）
            if (typeof MIDI !== 'undefined' && !MIDI.WebAudio) {
                MIDI.loadPlugin({
                    soundfontUrl: "../soundfont/",
                    instruments: ["acoustic_grand_piano"],
                    onsuccess: function() {
                        // 权限已授权，隐藏设置UI，显示测验
                        $("#quickstart-row").hide();
                        $("#quiz-row").show();
                    }
                });
            }
            
            // 2秒后恢复按钮状态，以便用户可以再次点击
            setTimeout(function() {
                $("#start-quiz").removeClass('clicked');
            }, 2000);
        });
    });
})(); 