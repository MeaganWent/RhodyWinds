$(document).ready(function () {

    $("#walletForm").on("submit", function (e) {
        e.preventDefault();

        const input = $("#bitcoinPassword").val();

        if (input === "super_duper_strong_pa55word") {
            $("#walletResult").html(`
                <img src="https://cdn-icons-png.flaticon.com/512/2489/2489756.png" width="200"/>
                <h2 style="color:#d9534f;margin-top:20px;">
                    CTF{rhodywinds_wallet_br34ch_2026}
                </h2>
            `);
        } else {
            $("#walletResult").html(`
                <p style="color:red;">Incorrect master password.</p>
            `);
        }

    });

});
